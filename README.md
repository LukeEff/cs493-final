# CS493 Final Project #
### Contributors: Luke Fernandez & Caleb Knight ###
This is our project for CS493.  The goal of this project is to create an app similar to Canvas known as Tarpaulin. Our app will containt 4 main entities: *Users*, *Courses*, *Assignments*, and *Submissions*. Each of these will have specifc routes and unique functions.

### **Running the App** ###

To run the app, you will need to have Docker installed.  Once you have Docker installed, you can run the following 
command to start the app:

```bash
docker-compose up
```

This will start the app on port 8000.  You can then access the app by going to http://localhost:8000.

Check the Postman collection for the routes and their functions as well as the OpenAPI specification for more 
information.

### **Users** ###
 Could be an *admin*, *instructor*, or a *student*.  Based on what role a User possesses, will depend on what permissions they will have.  

### **Courses** ###
 Will contain basic information such as *subject code*, *course number*, *title*, *instructor*, etc.  Each course will also contain a list of *students* that are enrolled, and a set of *assignments*.

### **Assignments** ### 
Will represent a single assignment for a **Course**.  Each of these **Assignments** will have information such as a *title*, *due date*, *list of students' submissions*, and more.

### **Submissions** ###
 Are a representation of a *single students' submission*.  Each of these **Submissions** is connected with a *students* with *timestamp* of when it was submitted.  Each submission will be associated to a *specific file* that will be to Tarpaulin and downloaded later.