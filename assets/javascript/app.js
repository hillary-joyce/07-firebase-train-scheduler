//Set the initial variables
var trainName = "";
var destination = "";
var firstTrain = "";
var frequency = 0;


//INITIALIZE FIREBASE
var config = {
  apiKey: "AIzaSyCpxgtsUrxoVIXiW8f4UMk0KLRUJAho2E0",
  authDomain: "train-schedule-efffa.firebaseapp.com",
  databaseURL: "https://train-schedule-efffa.firebaseio.com",
  projectId: "train-schedule-efffa",
  storageBucket: "train-schedule-efffa.appspot.com",
  messagingSenderId: "1076195990794"
};
firebase.initializeApp(config);

var database = firebase.database();


//Function adds the 24 hours and 60 minutes for the hour and minute option menus
function addHoursMinutes() {
  for (i = 0; i < 24; i++) {
    //create a new <option>
    var newHour = $("<option>");
    if (i < 10) {
      //if it's less than 10, add the leading 0 to the value and text (will need for hh:mm format)
      newHour.attr("value", "0" + i);
      newHour.text("0" + i);
    } else {
      //otherwise, just add the value
      newHour.attr("value", i)
      newHour.text(i);
    }
    //add to the select item
    $("#hours").append(newHour);
  }
  //repeat steps for hours for seconds
  for (i = 0; i < 60; i++) {
    var newMin = $("<option>");
    if (i < 10) {
      newMin.attr("value", "0" + i);
      newMin.text("0" + i);
    } else {
      newMin.attr("value", i);
      newMin.text(i);
    }
    $("#minutes").append(newMin);
  }
}


//function to add train to firebase
function addTrain() {
  //grab the user input and set the values to their respective variables
  trainName = $("#trainName").val().trim();
  destination = $("#destination").val().trim();
  firstTrain = $("#hours").val() + ":" + $("#minutes").val();
  frequency = $("#frequency").val().trim();

  //push the new information to firebase
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  });
};


//function to set the current time for the clock in the corner of the page
function setTime() {
  //set current time to the hour and minute of the day using momment
  var currentTime = moment().format("HH:mm");
  //change the text of currenttime to reflect the change
  $("#currentTime").text(currentTime);
};

//function to reflect updates and changes to the firebase database
function firebaseUpdate() {
  database.ref().on("child_added", function(childSnapshot) {
    //calculate the minutes away and time until next train variables
    // First Train Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment((childSnapshot.val().firstTrain), "hh:mm").subtract(1, "years");

    // Calculate difference between the current time and first train time
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Calculate the remainder (time the last trian left, in minutes)
    var tRemainder = diffTime % (childSnapshot.val().frequency);

    // Calculate minutes til the next train (frequency - time since last train)
    var tilNextTrain = (childSnapshot.val().frequency) - tRemainder;

    // Calculate the time of the next train
    var nextTrain = moment().add(tilNextTrain, "minutes");

    //create the row and data cells
    var newRow = $("<tr>")
    var newTrainName = $("<td class='trainName'>").text(childSnapshot.val().trainName);
    var newDestination = $("<td>").text(childSnapshot.val().destination);
    var newFrequency = $("<td>").text(childSnapshot.val().frequency);
    var newMinsAway = $("<td class='minsAway'>").text(tilNextTrain);
    var newNextTrain = $("<td>").text(moment(nextTrain).format("HH:mm"));

    //add cells to the row
    newRow.append(newTrainName);
    newRow.append(newDestination);
    newRow.append(newFrequency);
    newRow.append(newNextTrain);
    newRow.append(newMinsAway);

    //add row to the table
    $("tbody").append(newRow);
    // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });
}

//Update the train schedule every minute
function timeUpdate() {
  // empty the body of the table
  $("tbody").empty();
  //read once through every value in the firebase database
  database.ref().once("value")
    //then rerun the firebaseUpdate function to repopulate the table with the new time data
    .then(function(snapshot) {
      firebaseUpdate();
    });
  //add setTime function to update the clock in the corner
  setTime();
};

//when the document is ready,
$(document).ready(function() {
  //add the hours and minutes to the select menu
  addHoursMinutes();
  //add current time to the clock
  setTime();
  //check firebase for updates
  firebaseUpdate();
  //when the user clicks add train, run the addTrain function
  $("#submit").on("click", function(event) {
    event.preventDefault();
    addTrain();
  });
  //run the timeUpdate every 60 seconds
  setInterval(timeUpdate, 60000);
});
