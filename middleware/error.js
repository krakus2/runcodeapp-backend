const winston = require('winston');
//uzywam tego middleware'a w routes.js, a jest on wywolywany przez async middleware w przypadku błedu
//async middleware dziala implicit dzieki paczce express-async-errors, ktora implicit "owija"
//wszystkie route handler w

//prettier-ignore
module.exports = function(err, req, res, next) {
   winston.error(err.stack);
   if (err.message === 'Podałeś błędny parametr, to musi być liczba całkowita większa od 0') {
      return res.status(400).send('Podałeś błędny parametr, to musi być liczba całkowita większa od 0');
   } else if (err.message === 'Given ID is not valid') {
      return res.status(400).send('Given ID is not valid');
   } else if (err.message === "The task with the given ID doesn't exist") {
      return res.status(404).send("The task with the given ID doesn't exist");
   }
   res.status(500).send(`Something failed\n${err}`);
};
