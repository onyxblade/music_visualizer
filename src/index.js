import 'file?name=[name].[ext]!./index.html'
import kq from 'killerqueen'

kq.sheerHeartAttack()

var canvas = document.querySelector('#canvas').getContext('2d')

var audio = document.querySelector('#audio')
audio.play()

var context = new AudioContext()

var analyser = context.createAnalyser()
analyser.fftSize = 8192
analyser.minDecibels = -60
analyser.maxDecibels = -10
analyser.smoothingTimeConstant = 0.85
var mediaSource = context.createMediaElementSource(audio)
mediaSource.connect(analyser)
mediaSource.connect(context.destination)

//采样率往往大于人听到的频率，而大于20k的频率在频谱上没必要显示，故对fft结果取前n项。
function usableFftResultLength(sampleRate, fftSize, maxFreq){
	return Math.floor(maxFreq / (sampleRate / fftSize))
}

//实际显示的频谱柱使用指数坐标，参考“倍频程”。
function displayIndexes(usable, length){
	var t = Math.pow(usable, (1/length))
	var indexes = [0]
	for(var i=1; i < length; i++){
		indexes.push(Math.round(Math.pow(t, i)))
	}
	return indexes
}

var indexes = displayIndexes(usableFftResultLength(context.sampleRate, 8192, 20000), 30)
console.log(indexes)
var data = new Uint8Array(analyser.frequencyBinCount)

function draw(){
	analyser.getByteFrequencyData(data)
	var displayData = indexes.map(x => data[x])
	canvas.clearRect(0, 0, 1500, 300)
	displayData.map((x, i) => {
		canvas.fillStyle = `hsl(${(360 / 30)*i}, 100%, ${(x/255) * 40 + 30}%)`
		canvas.fillRect(i*15, (300-x), 10, x)
		//canvas.fillStyle = `hsl(${12*i}, 100%, ${(x/255) * 100}%)`
		//canvas.fillRect(i*10, (300-15), 10, 15)
	})
	requestAnimationFrame(draw)
}

draw()