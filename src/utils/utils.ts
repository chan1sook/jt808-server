export function formatHex(n: number, minLength = 2) {
  if(!Number.isInteger(n) || n < 0) {
    return "";
  }
  return '0x' + n.toString(16).toUpperCase().padStart(minLength, '0');
}

/**
 * convert original buffer with escape rule [0x7D 0x01] => 0x7D, [0x7D 0x02] => 0x7E
 * @param original Original Buffer
 */
export function unescapeJtt808Buffer(original: Buffer) {
  const arrBuffer: number[] = [];

  for(let i = 0; i < original.length; i++) {
    const byte1 = original.at(i);
    if(byte1 === 0x7D) {
      const byte2 = original.at(i + 1);
      if(byte2 === 0x01) {
        arrBuffer.push(0x7D);
        // skip extra byte
        i += 1;
      } else if(byte2 === 0x02) {
        arrBuffer.push(0x7F);
        // skip extra byte
        i += 1;
      } else {
        arrBuffer.push(byte1);
      }
    } else if(byte1 !== undefined) {
      arrBuffer.push(byte1);
    }
  }

  return Buffer.from(arrBuffer);
}

function bcdOf(n: number) {
  switch(n) {
    case 0:
      return "0";
    case 1:
      return "1";
    case 2:
      return "2";
    case 3:
      return "3";
    case 4:
      return "4";
    case 5:
      return "5";
    case 6:
      return "6";
    case 7:
      return "7";
    case 8:
      return "8";
    case 9:
      return "9";
    default:
      return '?';
  }
}

export function readBcdBE(buffer: Buffer, offset: number, size: number) : string {
  let result = "";
  // 1 read each bytes
  for(let i = 0; i < size; i++) {
    const cByte = buffer.readUInt8(i + offset);
    
    // each byte parse to 2 digits
    const highPart = (cByte & 0xF0) >> 4;
    result += bcdOf(highPart);
    const lowPart = cByte & 0x0F;
    result += bcdOf(lowPart);
  }
  return result;
}