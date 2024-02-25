# NYCares Tracker

I like volunteering. What I don't like is constantly having to check NYCares' website for available projects so I can register before they fill up.

This application checks for open weekend projects in Manhattan and sends me a nicely formatted email
with project names, locations, and signup links for any projects I haven't seen in the last 24 hours.

Additionally, I have a filter that removes certain projects I am not interested in seeing.

I am using AWS Lambda to run the code, AWS EventBridge to schedule Lambda invocations, AWS DynamoDB to record if projects have been seen or not, and Github Actions to automatically redeploy my Lambda on code push.
