import 'file?name=[name].[ext]!./index.html'
import kq from 'killerqueen'

kq.sheerHeartAttack()

var canvas = document.querySelector('#canvas')
var canvasContext = canvas.getContext('2d')

var audio = document.querySelector('#audio')
audio.play()

var context = new AudioContext()

var analyser = context.createAnalyser()
analyser.fftSize = 4096
analyser.minDecibels = -60
analyser.maxDecibels = 0
analyser.smoothingTimeConstant = 0.85
var mediaSource = context.createMediaElementSource(audio)
mediaSource.connect(analyser)
mediaSource.connect(context.destination)
var barCount = 30

document.querySelector('#file').onchange = function(e){
	audio.src = URL.createObjectURL(e.target.files[0])
	audio.play()
}

//采样率往往大于人听到的频率，而大于20k的频率在频谱上没必要显示，故对fft结果取前n项。
function usableFftResultLength(sampleRate, fftSize, maxFreq){
	return Math.floor(maxFreq / (sampleRate / fftSize))
}

//实际显示的频谱柱使用指数坐标，参考“倍频程”。
function displayIndexes(usable, length){
	var t = Math.pow(usable, (1/length))
	var indexes = Array(length-1).fill().reduce((acc, _, i) => {
		var current = acc[i]
		if(current * t - current > 1){
			return acc.concat([Math.round(current * t)])
		} else {
			return acc.concat([current+1])
		}
	}, [0])
	return indexes
}

var indexes = displayIndexes(usableFftResultLength(context.sampleRate, analyser.fftSize, 20000), barCount)
var data = new Uint8Array(analyser.frequencyBinCount)

function draw(){
	analyser.getByteFrequencyData(data)
	var displayData = indexes.map(x => data[x])
	canvasContext.clearRect(0, 0, canvas.width, canvas.height)
	displayData.map((x, i) => {
		//canvasContext.fillStyle = `hsl(${(360 / barCount)*i}, 100%, ${(x/255) * 40 + 30}%)`
		//canvasContext.fillRect(i*15, (canvas.height-x), 10, x)
		canvasContext.fillStyle = `hsla(${12*i}, 100%, 50%, ${(x/255)*1.5})`
		canvasContext.fillRect(i*10, (canvas.height-100), 10, 100)
	})
	requestAnimationFrame(draw)
}

draw()