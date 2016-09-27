# apicraftrva-lambda-iot

### Summary
We configured an AWS IoT button as the Lambda trigger, and a SINGLE click generates a non-spam message while a DOUBLE click generates a spam message.  The message is chosen from a small list at random, and a second Lambda function (not included here) is invoked to classify the text as spam or non-spam.  The result is sent to an SNS topic to which one or more cell phone numbers can be subscribed.  The result is also persisted as an item in a Dynamo DB table called 'iot_events'.  

### Pre-requisite steps

##### SNS Topic
Create an SNS topic (e.g. 'iot_topic').  Subscribe a cell phone to that topic.

##### DynamoDB table
Create a Dynamo DB table (e.g. 'iot_events') with a primary key (string) called 'timestamp'.

### IoT
When creating the Lambda function, click the dashed box and choose IoT as the event source / trigger.  The UI will take you through the steps to configure the IoT button, which requires entering a wifi network name/password and the IoT device serial number. 

### Lambda function
Copy-paste the code in index_unclassified.js into the 'Inline' code block in the AWS Lambda console UI.  Note that the index_classified.js handler invokes a second Lambda, which is not included here, but still shows how one Lambda can invoke another.

### IoT
The IoT event trigger simply generates an 'event' object with fields 'clickType' and 'serialNumber'.  Thus, in the handler code, there is no code for IoT configuration, because the result of the button click is the 'event' object.
