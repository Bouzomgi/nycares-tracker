# NYCares Tracker

I like to volunteer. What I don't like to do is constantly checking NYCare's website for available projects before they fill up.

This application checks for available weekend projects in Manhattan and sends a nicely formatted email
with project names, locations, and signup links for any projects I haven't seen in the last 24 hours.

I have a filter that removes certain projects I am not interested in.

I am using AWS Lambda to run the code, AWS EventBridge to schedule Lambda invocations, AWS DynamoDB to record if projects have been seen or not, and Github Actions to automatically redeploy my Lambda on code push.
