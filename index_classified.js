var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();
var sns = new AWS.SNS();
var dynamo = new AWS.DynamoDB.DocumentClient();

spam_messages = [];
nonspam_messages = [];
nonspam_messages.push("I'm gonna be home soon and i don't want to talk about this stuff anymore tonight, k? I've cried enough today.");
nonspam_messages.push("I HAVE A DATE ON SUNDAY WITH WILL!!");
nonspam_messages.push("Are you angry with me?");
nonspam_messages.push("Sorry, was in the bathroom, sup");
spam_messages.push("Your free ringtone is waiting to be collected. Get Usher and Britney.");
spam_messages.push("Get your garden ready for summer with a FREE selection of summer bulbs and seeds");
spam_messages.push("You are guaranteed the latest Nokia Phone, a 40GB iPod MP3 player");
spam_messages.push("You are awarded a SiPix Digital Camera! call 09061221061 from landline.");

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.handler = (event, context, callback) => {
    var req_body = {};
    if(event.clickType == "SINGLE") {
        var n = getRandomInt(0,3);
        console.log("n: " + n);
        req_body.text = nonspam_messages[n];
    }
    else if(event.clickType == "DOUBLE") {
        var n = getRandomInt(0,3);
        console.log("n: " + n);
        req_body.text = spam_messages[n];
    }
    
    var sms_params = {
        FunctionName: 'SMSSpam', /* required */
        Payload: JSON.stringify(req_body)
    };
    

    //classify text as spam/non-spam by invoking another lambda function
    var spam_obj = {};
    lambda.invoke(sms_params, function(err, data) {
        console.log("status code:" + data.StatusCode);
        console.log("payload:" + data.Payload);
        var spam_obj = JSON.parse(data.Payload);

        //publish spam classification result to SNS Topic
        var topic_params = {
            Message: JSON.stringify(spam_obj),
            TopicArn: "arn:aws:sns:eu-west-1:602791672431:iot_topic"
        };
        sns.publish(topic_params, context.done);
        
        //write item to DynamoDB table
        spam_obj.timestamp = String(new Date().getTime());
        var ddb_params = {
            TableName:'iot_events',
            Item: spam_obj
        };
        dynamo.put(ddb_params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        
        });

    });

    callback(null, 'Hello from IOT_SMS');
};