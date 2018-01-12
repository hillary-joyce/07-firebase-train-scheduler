var trainName = ""
var destination = ""
var firstTrain = ""
var frequency = 0
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
//Function adds the 24 hours and 60 minutes for the option menus
function addHoursMinutes() {
  for (i = 0; i < 25; i++) {
    var newHour = $("<option value=" + i + ">");
    if (i < 10) {
      newHour.attr("value", "0" + i);
      newHour.text("0" + i);
    } else {
      newHour.text(i);
    }
    $("#hours").append(newHour);
  }
  for (i = 0; i < 61; i++) {
    var newMin = $("<option value=" + i + ">");
    if (i < 10) {
      newMin.attr("value", "0" + i);
      newMin.text("0" + i);
    } else {
      newMin.text(i);
    }
    $("#minutes").append(newMin);
  }
}

function addTrain() {
  trainName = $("#trainName").val().trim();
  destination = $("#destination").val().trim();
  firstTrain = $("#hours").val() + ":" + $("#minutes").val();
  frequency = $("#frequency").val().trim();
  console.log(trainName);
  console.log(destination);
  console.log(firstTrain);
  console.log(frequency);
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  });
};
database.ref().on("child_added", function(childSnapshot) {
  //calculate the minutes away and time until next train variables
  // First Train Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment((childSnapshot.val().firstTrain), "hh:mm").subtract(1, "years");
  console.log(firstTimeConverted);
  // Calculate difference between the current time and first train time
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  console.log(diffTime);
  // Calculate the remainder (time the last trian left, in minutes)
  var tRemainder = diffTime % (childSnapshot.val().frequency);
  console.log(tRemainder);
  // Calculate minutes til the next train (frequency - time since last train)
  var tilNextTrain = (childSnapshot.val().frequency) - tRemainder;
  console.log(tilNextTrain);
  //
  // Calculate the time of the next train
  var nextTrain = moment().add(tilNextTrain, "minutes");
  console.log(moment(nextTrain).format("hh:mm"));
  //create the row and data cells to add to the table
  var newRow = $("<tr>")
  var newTrainName = $("<td>").text(childSnapshot.val().trainName);
  var newDestination = $("<td>").text(childSnapshot.val().destination);
  var newFrequency = $("<td>").text(childSnapshot.val().frequency);
  var newMinsAway = $("<td>").text(tilNextTrain);
  var newNextTrain = $("<td>").text(moment(nextTrain).format("HH:mm"));
  //add to the table
  newRow.append(newTrainName);
  newRow.append(newDestination);
  newRow.append(newFrequency);
  newRow.append(newNextTrain);
  newRow.append(newMinsAway);

  $("tbody").append(newRow);
  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});
//
$("#submit").on("click", function(event) {
  event.preventDefault();
  addTrain();
});
$(document).ready(addHoursMinutes);
