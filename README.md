# managerWorker
This app implement a simple auto scale mechanism, using https://nodejs.org/api/cluster.html

Run the application via cmd:
node src/app.js

The app exposing 2 APIs:
1. POST: 
/messages - Push a new message into the queue. The body contains a json with the following format:
            {
                "message":"Message to send"
            }
            
Each pushed message should trigger a function run. The function will
* Receive as input the message 
* then sleep for five seconds 
* and will print the content of the message to a shared file (file will be created if does not exist) 

            
            curl --header "Content-Type: application/json" --request POST --data '{"message":"xyz"}' http://localhost:8000/messages

2. GET: 
/statistics - Get back a json with the following structure:
              {
                  "active_instances": 5, # Number of function instances that are active
                  "total_invocation":20 # How many times the function got invocated
              }
              
              curl --header "Content-Type: application/json" --request GET  http://localhost:8000/statistics 


