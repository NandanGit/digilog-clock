const clock = document.querySelector('.clock');

const secondsHand = document.getElementById('seconds-hand');
const minutesHand = document.getElementById('minutes-hand');
const hoursHand = document.getElementById('hours-hand');

const secondsDisplay = document.getElementById('seconds-display');
const minutesDisplay = document.getElementById('minutes-display');
const hoursDisplay = document.getElementById('hours-display');
const millisecondsDisplay = document.getElementById('milliseconds-display');

const centerDial = document.getElementById('center-dial');

function processDate(date) {
	const dateHours = date.getHours();
	const dateMinutes = date.getMinutes();
	const dateSeconds = date.getSeconds();
	const dateMeridian = ['AM', 'PM'][Math.floor(date.getHours() / 12)];
	const dateMilliseconds = date.getMilliseconds();
	return {
		hours: dateHours,
		minutes: dateMinutes,
		seconds: dateSeconds,
		milliseconds: dateMilliseconds,
		meridian: dateMeridian,
	};
}

function calculateAngles(timeObj) {
	const secondsAngle = timeObj.seconds * 6 + 0.006 * timeObj.milliseconds;
	const minutesAngle = timeObj.minutes * 6 + 0.1 * timeObj.seconds;
	const hoursAngle =
		timeObj.hours * 30 +
		0.5 * timeObj.minutes +
		0.008333333333333333 * timeObj.seconds;
	return {
		secondsAngle,
		minutesAngle,
		hoursAngle,
	};
}

function setClockAngles(angles) {
	if (!angles) {
		secondsHand.style.transform = `translateX(-50%) rotate(0deg)`;
		minutesHand.style.transform = `translateX(-50%) rotate(0deg)`;
		hoursHand.style.transform = `translateX(-50%) rotate(0deg)`;
		return;
	}
	// console.log(angles);
	secondsHand.style.transform = `translateX(-50%) rotate(${angles.secondsAngle}deg)`;
	minutesHand.style.transform = `translateX(-50%) rotate(${angles.minutesAngle}deg)`;
	hoursHand.style.transform = `translateX(-50%) rotate(${angles.hoursAngle}deg)`;
}

function formatter(number, length = 2, fillChar = '0') {
	if (number < 0) {
		return fillChar.repeat(length);
	}
	number = Math.floor(number);
	return fillChar.repeat(length - `${number}`.length) + number;
}

function updateDigitalTime(timeObj) {
	if (!timeObj) {
		secondsDisplay.innerHTML = '00';
		minutesDisplay.innerHTML = '00';
		hoursDisplay.innerHTML = '00';
		return;
	}
	secondsDisplay.innerHTML = formatter(timeObj.seconds, 2, '0');
	minutesDisplay.innerHTML = formatter(timeObj.minutes, 2, '0');
	hoursDisplay.innerHTML = formatter(timeObj.hours, 2, '0');
}

function startClock() {
	const timeObj = processDate(new Date());
	setClockAngles(calculateAngles(timeObj));
	updateDigitalTime(timeObj);
}

function max(arr) {
	let res = arr[0];
	for (const elem of arr) {
		if (elem > res) {
			res = elem;
		}
	}
	return res;
}

let timeChangeEffectTimer;

function rapidTimeChangeEffect(target, effectLength = 0.75) {
	if (timeChangeEffectTimer) {
		clearInterval(timeChangeEffectTimer);
	}
	if (!target) {
		// Decrease the time to 00:00:00
		const currentHours = +hoursDisplay.innerHTML;
		const currentMinutes = +minutesDisplay.innerHTML;
		const currentSeconds = +secondsDisplay.innerHTML;
		const noOfCycles = max([currentHours, currentMinutes, currentSeconds]);
		// We have to plan our update cycles according to the max variable
		let counter = noOfCycles;
		let hours = currentHours;
		let minutes = currentMinutes;
		let seconds = currentSeconds;
		timeChangeEffectTimer = setInterval(() => {
			if (counter === 0) {
				clearInterval(timeChangeEffectTimer);
			}
			// Display the Values
			hoursDisplay.innerHTML = formatter(hours);
			minutesDisplay.innerHTML = formatter(minutes);
			secondsDisplay.innerHTML = formatter(seconds);

			hours -= currentHours / noOfCycles;
			minutes -= currentMinutes / noOfCycles;
			seconds -= currentSeconds / noOfCycles;
			counter -= 1;
		}, (effectLength * 1000) / noOfCycles);
		return;
	}
	// If there is a target, increase the time accordingly
	const noOfCycles = max([target.hours, target.minutes, target.seconds]);
	// We have to plan our update cycles according to the max variable
	let counter = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;
	timeChangeEffectTimer = setInterval(() => {
		if (counter === noOfCycles) {
			clearInterval(timeChangeEffectTimer);
		}
		// Display the Values
		hoursDisplay.innerHTML = formatter(hours);
		minutesDisplay.innerHTML = formatter(minutes);
		secondsDisplay.innerHTML = formatter(seconds);

		hours += target.hours / noOfCycles;
		minutes += target.minutes / noOfCycles;
		seconds += target.seconds / noOfCycles;
		counter += 1;
	}, (effectLength * 1000) / noOfCycles);
}

// Setup
let refreshFrequency = 1000;
// clock.classList.remove('broken');
// startClock();
// rapidTimeChangeEffect(processDate(new Date()));
// let clockRunner = setInterval(startClock, refreshFrequency);
clockRunner = false;

centerDial.addEventListener('click', () => {
	if (clockRunner) {
		clearInterval(clockRunner);
		clockRunner = false;
		// Set the clock to 00:00:00 (Both analog and digital)
		rapidTimeChangeEffect();
		setClockAngles();
		updateDigitalTime();

		// Break the clock
		clock.classList.add('broken');
	} else {
		startClock();
		rapidTimeChangeEffect(processDate(new Date()));
		clockRunner = setInterval(startClock, refreshFrequency);
		clock.classList.remove('broken');
	}
});

const setFrequenctTrigger = document.getElementById('set-frequency');
// console.log(setFrequenctTrigger);
setFrequenctTrigger.addEventListener('click', () => {
	const newFrequency = prompt('Enter a new Frequency(Hz): ');
	refreshFrequency = +newFrequency;
	clearInterval(clockRunner);
	clockRunner = false;
	// Set the clock to 00:00:00 (Both analog and digital)
	// setClockAngles();
	updateDigitalTime();
	startClock();
	clockRunner = setInterval(startClock, refreshFrequency);
});
