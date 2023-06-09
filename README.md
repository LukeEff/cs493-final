# CS493 Final Project#
### Contributors: Luke Fernandez & Caleb Knight ###
This is our project for CS493.  The goal of this project is to create an app similar to Canvas known as Tarpaulin. Our app will containt 4 main entities: *Users*, *Courses*, *Assignments*, and *Submissions*. Each of these will have specifc routes and unique functions.

**Users** could be an *admin*, *instructor*, or a *student*.  Based on what role a User possesses, will depend on what permissions they will have.  

**Courses** will contain basic information such as *subject code*, *course number*, *title*, *instructor*, etc.  Each course will also contain a list of *students* that are enrolled, and a set of *assignments*.

**Assignments** will represent a single assignment for a **Course**.  Each of these **Assignments** will have information such as a *title*, *due date*, *list of students' submissions*, and more.

**Submissions** are a representation of a *single students' submission*.  Each of these **Submissions** is connected with a *students* with *timestamp* of when it was submitted.  Each submission will be associated to a *specific file* that will be to Tarpaulin and downloaded later.