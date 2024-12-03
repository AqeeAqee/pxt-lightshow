// Add your code here
let strip = light.createStrip(pins.MOSI, 16 * 16, NeoPixelMode.RGB)
// strip.setBrightness(255)
strip.setBuffered(true)
strip.setAll(0x1F1F1F)
strip.setAll(0x00FFFF)
// strip.showAnimationFrame(light.rainbowAnimation)
// strip.showAnimation(light.rainbowAnimation, 50000)
// strip.show()
for (let i = 0; i < strip.length(); i++) {
    strip.setPixelColor(i, light.hsv(((i) << 8) / strip.length(), 255, 55))
}
stripShow.show(strip, pins.MOSI)


// game.onUpdateInterval(100, function () { //doesn't work, why?
while (true) {
    const ms = control.millis()
    strip.move(LightMove.Rotate, 4)
    stripShow.show(strip, pins.MOSI)
    pause(Math.max(0, ms + 75 - control.millis()))

    // pins.P1.digitalWrite(false)
    // pause(200)
    // pins.P1.digitalWrite(true)
}
// })
