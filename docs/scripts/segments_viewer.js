class SegmentsViewer {
    constructor(node, segmentTypesCount) {
        this.node = node;
        this.segmentTypesCount = segmentTypesCount;
        this.blockMap = new Map();
        this.selectedBlocks = [];
    }

    createReservedCodeUnitBlock(segmentType) {
        let block = document.createElement("div");
        block.setAttribute("class", `block twilio ${segmentType}`);
        let span = document.createElement('span');
        span.textContent = "H";

        block.appendChild(span);
        return block;
    }

    createCodeUnitBlock(codeUnit, segmentType, mapKey, isGSM7) {
        let block = document.createElement('div');
        block.setAttribute('class', `block ${segmentType} ${isGSM7 ? '' : 'non-gsm'}`);

        block.setAttribute("data-key", mapKey);
        this.blockMap.get(mapKey).push(block);

        let span = document.createElement('span');
        span.textContent = "0x" + codeUnit.toString(16).padStart(4, '0').toUpperCase();

        block.appendChild(span);
        return block;
    }

    update(segmentedMessage) {
        this.blockMap.clear();

        let newSegments = document.createElement("div");
        newSegments.setAttribute("id", "segments-viewer");

        for (let segmentIndex = 0; segmentIndex < segmentedMessage.segments.length; segmentIndex++) {
            const segmentType = `segment-type-${segmentIndex % this.segmentTypesCount}`;
            const segment = segmentedMessage.segments[segmentIndex];

            for (let charIndex = 0; charIndex < segment.length; charIndex++) {
                const encodedChar = segment[charIndex];
                const mapKey = `${segmentIndex}-${charIndex}`;
                this.blockMap.set(mapKey, []);

                if (encodedChar.isReservedChar) {
                    newSegments.appendChild(this.createReservedCodeUnitBlock(segmentType));
                } else {
                    if (encodedChar.codeUnits) {
                        for (const codeUnit of encodedChar.codeUnits) {
                            newSegments.appendChild(
                                this.createCodeUnitBlock(codeUnit, segmentType, mapKey, encodedChar.isGSM7)
                            );
                        }
                    }
                }
            }
        }

        this.node.replaceWith(newSegments);
        this.node = newSegments;
    }

    select(mapKey) {
        this.clearSelection();

        for (let block of this.blockMap.get(mapKey)) {
            block.classList.add("selected");
            this.selectedBlocks.push(block);
        }
    }

    clearSelection() {
        for (let block of this.selectedBlocks) {
            block.classList.remove("selected");
        }

        this.selectedBlocks.length = 0;
    }
}


class MessageViewer {
    constructor(node, segmentTypesCount) {
        this.node = node;
        this.segmentTypesCount = segmentTypesCount;
        this.blockMap = new Map();
        this.selectedBlock = null;
    }

    createCharBlock(encodedChar, segmentType, mapKey) {
        let block = document.createElement('div');
        block.setAttribute('class', `block ${segmentType}`);
        if (!encodedChar.codeUnits) {
            block.classList.add('error');
        }

        block.setAttribute("data-key", mapKey);
        this.blockMap.set(mapKey, block);

        let span = document.createElement('span');
        span.textContent = encodedChar.raw.replace(' ', '\u00A0');
        block.appendChild(span);
        return block;
    }

    update(segmentedMessage) {
        this.blockMap.clear();
        let newMessage = document.createElement("div");
        newMessage.setAttribute("id", "message-viewer");

        for (let segmentIndex = 0; segmentIndex < segmentedMessage.segments.length; segmentIndex++) {
            const segmentType = `segment-type-${segmentIndex % this.segmentTypesCount}`;
            const segment = segmentedMessage.segments[segmentIndex];

            for (let charIndex = 0; charIndex < segment.length; charIndex++) {
                const encodedChar = segment[charIndex];
                const mapKey = `${segmentIndex}-${charIndex}`;

                if (!(encodedChar.isReservedChar)) {
                    newMessage.appendChild(this.createCharBlock(encodedChar, segmentType, mapKey));
                }
            }
        }

        this.node.replaceWith(newMessage);
        this.node = newMessage;

        this.markInvisibleCharacters();
    }

    markInvisibleCharacters() {
        for (let span of this.node.querySelectorAll("span")) {
            if (span.offsetWidth === 0) {
                span.classList.add("invisible");
            }
        }
    }

    select(mapKey) {
        this.clearSelection();

        this.selectedBlock = this.blockMap.get(mapKey);
        this.selectedBlock.classList.add("selected");
    }

    clearSelection() {
        if (this.selectedBlock) {
            this.selectedBlock.classList.remove("selected");
        }
        this.selectedBlock = null;        
    }
}

class WarningsViewer {
    constructor(node) {
        this.node = node;
    }

    createWarningBlock(warning){
        const warningParagraph = document.createElement("p");
        warningParagraph.innerText = warning;
        return warningParagraph;
    }

    update(warnings){
        this.node.innerHTML = '';
        warnings.forEach(warning => {
            this.node.appendChild(this.createWarningBlock(warning))
        });
    }
}