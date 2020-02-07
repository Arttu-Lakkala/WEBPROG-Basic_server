Done as a web programming exrecise limited functionality and some mistakes still exist in code.

The program is split between the Template and React folders based on the access method. The API is only implemented in the React portion of the program.

I made the decision not to allow admin to change the final membership date, since I am not sure how it would realisticly be implemented considering the members are supposed to pay for membership and admin modifying it could be potentialy dangerous.

The payment is also hevily simplyfied. Simply asking for a "card number" over 0 in the Template model and a simple post method in the React model.

Username and Password are conssiderd valid if they are longer than 5 characters(Not actually enough for a safe password). The email is also checkes to be a valid email.
When changin the users data all fields must be filled even if only some need to be changed, simply enter the current value if you don't want the value in question to be changed.

The UI is practicaly nonexistant and the program is simply focused on function.

Data can be added by calling node add.js in React folder after starting mongodb