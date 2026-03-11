function sumFibonacci() {

    let a = 0;
    let b = 1;
    let count = 0;
    let sum = 0;

    while (count < 10) {
        sum += a;

        let next = a + b;
        a = b;
        b = next;

        count++;
    }

    console.log("The sum of the first 10 Fibonacci numbers: ", sum);
}

sumFibonacci();

function sumPrimeNumbers() {
    let sum = 0;

    for (let i = 2; i <= 1000; i++){
        let isPrime = true;

        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime){
            sum += i;
        }
    }

    console.log("Sum of prime numbers from 1 to 1000:", sum);
}

sumPrimeNumbers();

function dayOfWeek(){
    let number = prompt("Enter a number from 1 to 7");

    number = Number(number);

    switch (number) {
        case 1:
            alert("Monday");
            break;
        case 2:
            alert("Tuesday");
            break;
        case 3:
            alert("Wednesday");
            break;
        case 4:
            alert("Thursday");
            break;
        case 5:
            alert("Friday");
            break;
        case 6:
            alert("Saturday");
            break;
        case 7:
            alert("Sunday");
            break;
        default:
            alert("Invalid number");
    }
}

dayOfWeek();

function stringsOddLength(arr) {
    let result = [];

    for (let i = 0; i < arr.length; i ++){
        if (arr[i].length % 2 !== 0) {
            result.push(arr[i]);
        }
    }
    return result;
}

let strings = ["cat", "hello", "hi", "sun"];
console.log(stringsOddLength(strings));

const plusOne = (numbers) => {
    let result = [];
    for (let i = 0; i < numbers.length; i++) {
        result.push(numbers[i] + 1);
    }

    return result;
};

let nums = [1, 2, 3, 4, 5];
console.log(plusOne(nums));

function sumOrDifference(a, b) {
    if (a + b === 10 || Math.abs(a-b) === 10){
        return true;
    }

    return false;
}

console.log(sumOrDifference(7, 3));
console.log(sumOrDifference(20, 10));
console.log(sumOrDifference(1, 3));