# dependencies-resolver
This is a web service that return full package
dependency tree based on a given package name (user input).

Run the application via cmd:
node src/server.js

When is server is up, send GET API request using the URL:
http://localhost:8000/package/<packageName>/<version>
like: http://localhost:8000/package/express/latest
or: http://localhost:8000/package/async/2.0.1

note: currently you want see the tree view in the API response, only as console output when running the app from an idea


TODOs:
1. missing tests
2. return the pretty tree as a server response 
3. add user input validation
4. improve the tree printing visualization
5. improve performance - async calls to NPM/cache