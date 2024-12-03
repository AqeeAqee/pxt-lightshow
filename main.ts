// aqee, 241201
// send out Strip buf to data pin via SPI interface
// make for Pico(RP2040), for buildin 'Light' extentino doesn't work on Pico
// ref spiNeopixelSendBuffer() in pxt-common-packages\libs\core\light.cpp
// ref https://github.com/lancaster-university/codal-rp2040/blob/master/source/RP2040Spi.cpp
// OK. bitExpand_4 is best
// bitExpand_3 not work, maybe low freq of SPI pause too long between each 8-bit sections.

/**
 * Provide WS2812b neo strip show() function, for some chips which Arcade buildin light.show() doesn't work for them, eg: RP Pico
 */
//% weight=100 color="#0078d7" icon="\uf00a"
namespace stripShow {
    //%
    export function show(strip: light.NeoPixelStrip, dataPin: DigitalInOutPin) {
        // console.log("[" + strip.buf.toHex() + "]")
        let arrayTx = bitExpand_4(strip.buf.toArray(NumberFormat.UInt8BE))
        let bufTx = Buffer.fromArray(arrayTx)
        let spi = pins.createSPI(dataPin, null, null)
        // spi.setMode(0)
        spi.setFrequency(3200000)
        spi.transfer(bufTx, null)
        pause(10) //for safe, avoid refresh too fast to disorder display
        // console.log(arrayTx.length)
        // console.log(bufTx.length)
        // console.log(bufTx.toHex())
    }

    // NOT work!
    // 2.4MHz
    function bitExpand_3(bytes: number[]): number[] {
        // const BIT_EXPANSION = 3
        let ptrTx = 120
        let arrayTx = []
        for (let i = 0; i < bytes.length; i++) {
            let neo = bytes[i]
            let bits24 = 0
            for (let j = 0; j < 8; j++) {
                let bits3 = neo & 0x80 ? 0b110 : 0b100
                bits24 = (bits24 << 3) | bits3
                neo <<= 1
            }
            for (let j = 0; j < 3; j++) {
                arrayTx[ptrTx] = (bits24 >> 16) & 0xff
                bits24 <<= 8
                ptrTx += 1
            }
        }
        arrayTx[ptrTx + 90 - 1] = 0  //add more blank for reset signal
        return arrayTx
    }

    // worked
    // 6.4Mhz(or 4.8+)
    function bitExpand_8(bytes: number[]): number[] {
        // const BIT_EXPANSION = 8
        let ptrTx = 120 // header blank for reset signal
        let arrayTx = []
        for (let i = 0; i < bytes.length; i++) {
            let byte = bytes[i]
            for (let k = 7; k >= 0; k--) {
                arrayTx[ptrTx] = (byte >> k) & 1 ? 0b1111100 : 0b11000000
                ptrTx += 1
            }
        }
        arrayTx[ptrTx + 90 - 1] = 0  //add more blank for reset signal
        return arrayTx
    }

    // worked
    // 3.2MHz(or 2.4+) 
    function bitExpand_4(bytes: number[]): number[] {
        // const BIT_EXPANSION = 4
        let ptrTx = 120 // header blank for reset signal
        let arrayTx = []
        for (let i = 0; i < bytes.length; i++) {
            let byte = bytes[i]
            for (let k = 7; k >= 0; k--) {
                arrayTx[ptrTx] = (byte >> k) & 1 ? 0b1110 : 0b1000
                //next bit
                k-=1
                arrayTx[ptrTx]<<=4
                arrayTx[ptrTx] |= (byte >> k) & 1 ? 0b1110 : 0b1000
                ptrTx += 1
            }
        }
        arrayTx[ptrTx + 90 - 1] = 0  //add more blank for reset signal
        return arrayTx
    }
}
