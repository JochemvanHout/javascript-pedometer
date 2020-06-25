/**
* Made by Jochem van Hout
* This is the first iteration of the step per minute detector, made as part of the One Step Beyond Fontys Lectoraat project
* The step detection part was written by Olaf Janssen, and modified by us
*
* This program is designed to get the average running speed
* This works by calculating the steps per minute
* Once the user has pressed start, he can start running
* The application calculates the steps per minute, everytime it detects a new steps, by comparing the amount of steps with the time passed
* This value is inserted into an Array
* Once the array has reached a certain length, it starts checking if the tempo is consistent, with a certain margin of error
* Once the system detects a consistent tempo has been reached, this value is outputted
*
* I've tested this and it works fairly well, the bpm detection is really accurate with the motion sensor of a phone
* However, it struggles with a inconsistent running speed
*/

////////////////////////////
// variables, options etc //
////////////////////////////
let strikeDetector = new FootStrikeDetector({}, onFootStrike);

let preStepAmount = 1;
let preSteps = 0;
let steps = 0;

const margin = 1;
const checkLength = 10;

let applicationStarted;
let spmArray = [];
let startTime, endTime;

let averageStepsPerMinute;
////////////////////////////
// end of options and var //
////////////////////////////

// Checks if devive has motion sensor
if (window.DeviceMotionEvent != undefined) {
    window.ondevicemotion = function (e) {
        let data = {
            t: new Date().getTime(),
            motion: {
                a: [e.accelerationIncludingGravity.x, e.accelerationIncludingGravity.y, e.accelerationIncludingGravity.z]
            }
        };

        let d = data;
        let absa = Math.sqrt(Math.pow(d.motion.a[0], 2) + Math.pow(d.motion.a[1], 2) + Math.pow(d.motion.a[2], 2));
        let bf = strikeDetector.push(absa);

    }
} else {
    console.log('Device motion not supported.');
}


// this function fires everytime the mobile device senses a footstep
function onFootStrike() {
    if(applicationStarted){
        stepTracker();
    }
}


// on spacebar press (testing purposes)
window.onkeyup = function(e) {
	if(e.keyCode === 32 && applicationStarted) {
        stepTracker();
	}
}


function stepTracker(){
    // 10 leading steps, the runner strats running and isn't on his normal speed
    preSteps++;
    if(preSteps > preStepAmount){
        // start the timer, if it hasn't already
        if(startTime == null){
            startTime = new Date();
        }

    // Every step after the 10th one gets checked
    calculateSPM();

    // writes the amount of steps taken to a div element
    document.getElementById("stepCounter").innerHTML = steps;
    }
}


// Pushes the average spm of the latest step into the array
function calculateSPM (){

	endTime = new Date();
  	let timeDiff = endTime - startTime; //in ms

        /* 
        * This small check prevents double registrations
        * If the steps are atleast 100ms apart it will register
        * for the record, taking a step every 100ms would mean taking 600 steps per minute 
        */ 
        if(timeDiff > 100){
            steps++;

            console.log("time difference", timeDiff, "steps:", steps);

            spmArray.push((steps / timeDiff * 60000).toFixed(1));

            console.log(checkForConsistency());

            if (checkForConsistency()){
                // stop tracking
                applicationStarted = false;
                // write average spm to a div
                document.getElementById("avgSPM").innerHTML = "Your average steps per minute is roughly " + averageStepsPerMinute;

                document.getElementById("completionAudio").play();
            }
        }
  	console.log(spmArray);
}


function checkForConsistency(){
    // don't check if there isn't enough data
    if(spmArray.length > checkLength){
        // get the last x amount of entries in the array
        let latestEntriesArray = spmArray.slice(Math.max(spmArray.length - checkLength, 1));

        let averageOfLastEntries = 0;
        let allWithinMargin = true;

        // add up the latest entries of the array
        for(i=0;i<latestEntriesArray.length;i++){
            averageOfLastEntries = averageOfLastEntries + Number(latestEntriesArray[i]);
        }

        // get the average of them
        averageOfLastEntries = averageOfLastEntries / checkLength;

        // check if the difference between each entry is within a certain margin of the average, if one falls outside of this margin, return false
        for(i=0;i<latestEntriesArray.length;i++){
            if(Math.abs(averageOfLastEntries - latestEntriesArray[i]) >= margin){
                allWithinMargin = false;
                averageStepsPerMinute = Math.round(latestEntriesArray.slice(-1)[0]);
                return false;
            }
        }

        // if all the numbers are within the margin
        return true;

    }
}


// Start button, the user has to give input when the step detection starts
let button = document.getElementById("startButton");

button.addEventListener("click",function(e){
	button.disabled = "true";
	applicationStarted = true;
},false);