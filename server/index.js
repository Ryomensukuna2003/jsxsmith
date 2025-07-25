const expeess = require('express');
const app = expeess();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Heloowwww!');
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});