function findMinMax(numbers) {
    let min = numbers[0];
    let max = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] < min) {
            min = numbers[i];
        }

        if (numbers[i] > max){
            max = numbers[i];
        }

    }

    return {min: min, max: max};

}

let result = findMinMax([3, 7, 1, 9, 4]);
console.log("Мінімум:", result.min);
console.log("Максимум:", result.max);

function compareObjects(obj1, obj2) {
    if (obj1.name === obj2.name && obj1.age === obj2.age) {
        return "Об'єкти однакові";
    }
    else {
        return "Об'єкти різні";
    }
}

let person1 = {name: "Anna", age: 20};
let person2 = {name: "Anna", age: 20};

console.log(compareObjects(person1, person2))

function isinRange (number, min, max) {
    return number >= min && number <= max;
}

console.log(isinRange(5, 1, 10));

let isActive = true;

isActive = !isActive;

console.log(isActive)

function getGradeText1(grade) {
    if (grade >= 90) {
        return "Відмінно";
    }
    else if (grade>= 70 ) {
        return "Добре";
    }
    else if (grade>= 50) {
        return "Задовільно";
    }
    else {
        return "Не задовільно";
    }
}

console.log(getGradeText1(85))

function getGradeText2(grade) {
    return grade >= 90 ? "Відмінно" :
        grade >= 70 ? "Добре" :
               grade >= 50 ? "Задовільно" :
                   "Не задовільно";
}

console.log(getGradeText2(85))


function getSeason1(month) {
    if (month >= 1 && month <=12){
        if (month === 12 || month === 1 || month === 2){
            return "Зима";
        }
        else if (month >=3 && month <= 5) {
            return "Весна";
        }
        else if (month >= 6 && month <= 8) {
            return "Літо";
        }
        else {
            return "Осінь";
        }

    }
    else {
        return "Невідомий місяць";
    }
}

console.log(getSeason1(1))

function getSeason2(month) {
    return (month < 1 || month > 12) ? "Невірний місяць" :
        (month === 12 || month <= 2) ? "Зима" :
            (month <=5) ? "Весна" :
                (month <= 8) ? "Літо" :
                    "Осінь";
}

console.log(getSeason2(1))