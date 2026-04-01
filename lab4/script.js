function processFruitsArray() {
    let fruits = ["apple", "banana", "lemon"];

    fruits.pop();
    console.log("1.1:", fruits);

    fruits.unshift("ananas");

    fruits.sort().reverse();
    console.log("1.3:", fruits);

    let index = fruits.indexOf("apple");
    console.log("1.4:", index)
}

processFruitsArray();

function analyzeColorsArray(){
    let colors = ["red", "blue", "green", "yellow"];

    let longest = colors[0];
    let shortest = colors[0];

    for(let color of colors) {
        if (color.length > longest.length) longest = color;
        if (color.length < shortest.length) shortest = color;
    }

    console.log("2.2 Longest:", longest);
    console.log("2.2 Shortest:", shortest);

    let filtered = colors.filter(c => c.includes("blue"));
    console.log("2.3:", filtered);

    let result = filtered.join(", ");
    console.log("2.5:", result)
}

analyzeColorsArray();

function manageEmployeesData(){
    let employees = [
        {name: "Ivan", age: 25, position: "Developer"},
        {name: "Maria", age: 30, position: "Designer"},
        {name: "Olena", age: 22, position: "Developer"}
    ];

    employees.sort((a, b)=> a.name.localeCompare(b.name));
    console.log("3.2", employees);

    let devs = employees.filter(e => e.position === "Developer");
    console.log("3.3:", devs);

    employees = employees.filter(e => e.age >= 28);
    console.log("3.4:", employees);

    employees.push({name: "Oleg", age: 35, position: "Manager"});
    console.log("3.5", employees);
}

manageEmployeesData();

function manageStudentsData(){
    let students = [
        {name: "Oleksiy", age: 20, course: 2},
        {name: "Anna", age: 21, course: 3},
        {name: "Bogdan", age:19, course: 1}
    ]

    students = students.filter(s => s.name !== "Oleksiy");

    students.push({name: "Max", age: 23, course: 4});

    students.sort((a, b) => b.age - a.age);

    let thirdCourse = students.find(s => s.course === 3);

    console.log("4:", students);
    console.log("4.5:", thirdCourse)
}

manageStudentsData();

function performArrayCalculations(){
    let numbers = [1, 2, 3, 4, 5];

    let squared = numbers.map(n => n * n);
    console.log("5.1:", squared);

    let even = numbers.filter(n => n % 2 === 0);
    console.log("5.2", even);

    let sum = numbers.reduce((acc, n) => acc + n, 0);
    console.log("5.3:", sum);

    let extra = [6, 7, 8, 9, 10];
    numbers = numbers.concat(extra);
    console.log("5.4:", numbers);

    numbers.splice(0, 3);
    console.log("5.5:", numbers);
}

performArrayCalculations();

function libraryManagement() {
    let books = [
        {title: " Kobzar", author: "Taras Shevchenko", genre: "poetry", pages: 200, isAvailable: true},
        {title: "The Game of Thrones", author:"George R. R. Martin ", genre: "fantasy", pages: 800, isAvailable: true}
    ];

    function addBook(title, author, genre, pages) {
        books.push({title, author, genre, pages, isAvailable: true});
    }

    function removeBook(title) {
        books = books.filter(b => b.title !== title);
    }

    function findBooksByAuthor(author) {
        return books.filter(b => b.author === author);
    }

    function toggleBookAvailability(title, isBorrowed) {
        books = books.map(b => {
            if(b.title === title) {
                b.isAvailable = isBorrowed;
                return b
            }
            return b;
        }) ;

    }

    function sortedBooksByPages() {
        books.sort((a, b) => a.pages - b.pages);
    }

    function getBooksStatistics() {
        let total = books.length;
        let available = books.filter(b => b.isAvailable).length;
        let taken = total - available;
        let avg = books.reduce((acc, b) => acc + b.pages, 0) / total;

        return {total, available, taken, avg};
    }

    addBook("Harry Potter", "J.K. Rowling", "fantasy", 400);
    removeBook("The Game of Thrones");
    toggleBookAvailability("Kobzar", true);
    sortedBooksByPages();

    console.log("6.", books);
    console.log("6.", findBooksByAuthor("Taras Shevchenko"));
    console.log("6.", getBooksStatistics());
}

libraryManagement();

function updateStudentObject() {
    let student = {name: "Oksana", age: 19, course: 2};

    student.subjects = ["Web-technologies", "Java", "English"];

    delete student.age;

    console.log("7.", student);
}

updateStudentObject();