'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayDate = function() {
  const timeNow = new Date();
  const day = `${timeNow.getDate()}`.padStart(2, 0);
  const month = `${timeNow.getMonth()}`.padStart(2, 0);
  const year = timeNow.getFullYear();
  const hours = `${timeNow.getHours()}`.padStart(2, 0);
  const minutes = `${timeNow.getMinutes()}`.padStart(2, 0);
  labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`
}

const createUsernames = function (accs) {
  accs.forEach(function(acc) {
    acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('')
  });
};
createUsernames(accounts);

const displayMovements = (function(acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function(mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const movDates = new Date (acc.movementsDates[i]);
    const day = `${movDates.getDate()}`.padStart(2, 0);
    const month = `${movDates.getMonth()}`.padStart(2, 0);
    const year = movDates.getFullYear();

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__date">${day}/${month}/${year}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>`

        containerMovements.insertAdjacentHTML('afterbegin', html);
  });
});

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const caclDisplaySummary = function(acc) {
  const inSum = acc.movements
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${inSum.toFixed(2)}€`

  const outSum = acc.movements
  .filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outSum.toFixed(2))}€`

  const interestSum = acc.movements
  .filter(mov => mov > 0)
  .map(dep => dep * acc.interestRate * 0.01)
  .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interestSum.toFixed(2)}€`
}

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  caclDisplaySummary(acc);
  displayDate();
}

let currentUser, timer;

const startLogOutTimer = function () {
  const tick = function() {
    const min = String(Math.trunc(time / 60)).padStart(2, 0)
    const sec = String(time % 60).padStart(2, 0)

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = `Log in to get started`

      containerApp.style.opacity = 0;
    };

    time--;
  };
  
  let time = 600;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentUser?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${currentUser.owner.split(' ')[0]}`

    containerApp.style.opacity = 100;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentUser);
  }
});

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur()

  if (
    amount > 0 &&
    receiverAcc &&
    receiverAcc?.username !== currentUser.username &&
    currentUser.balance >= amount
    ) {
      currentUser.movements.push(-amount);
      receiverAcc.movements.push(amount);

      currentUser.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());

      clearInterval(timer);
      timer = startLogOutTimer();
    }

    updateUI(currentUser);
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentUser.username &&
    Number(inputClosePin.value) === currentUser.pin
    ) {
      const index = accounts.findIndex(acc => acc.username === currentUser.username)

      accounts.splice(index, 1)

      containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentUser.movements.some(mov => mov >= amount/10)
    ) {
      setTimeout(() => {
        currentUser.movements.push(amount);
        currentUser.movementsDates.push(new Date().toISOString());
  
        updateUI(currentUser);

        clearInterval(timer);
        timer = startLogOutTimer();
      }, 2500)
    }

    inputLoanAmount.value = '';
    inputLoanAmount.blur();
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentUser.movements, !sorted);
  sorted = !sorted;
})



/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
