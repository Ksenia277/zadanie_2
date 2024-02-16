const storageKey = 'new'; // Убедитесь, что ключ соответствует вашему хранилищу

const storageData = localStorage.getItem(storageKey);

const initialData = storageData ? JSON.parse(storageData) : {
    firstColumn: [],
    secondColumn: [],
    thirdColumn: []
};

let app = new Vue({
    el: '#new',
    data: {
        firstColumn: initialData.firstColumn,
        secondColumn: initialData.secondColumn,
        thirdColumn: initialData.thirdColumn,
        groupName: null,
        inputOne: null,
        inputTwo: null,
        inputThr: null,
        inputFor: null,
        inputFiv: null,
        showModal: false,
        errors: []
    },
    watch: {
        firstColumn: {
            handler(newFirstColumn) {
                this.saveData();
            },
            deep: true
        },
        secondColumn: {
            handler(newSecondColumn) {
                this.saveData();
            },
            deep: true
        },
        thirdColumn: {
            handler(newThirdColumn) {
                this.saveData();
            },
            deep: true
        }
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        saveData() {
            const data = {
                firstColumn: this.firstColumn,
                secondColumn: this.secondColumn,
                thirdColumn: this.thirdColumn
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
        },
        updateProgress(card) {
            const checkedCount = card.items.filter(item => item.checked).length;
            const progress = (checkedCount / card.items.length) * 100;
            card.isComplete = progress === 100;

            if (card.isComplete) {
                card.lastChecked = new Date().toLocaleString(); // Обновляем дату и время
            }

            // Проверка на переход с 50% до 100%
            if (progress >= 50 && !card.isComplete) {
                // Перемещение карточки из первого столбца во второй
                this.moveCardBetweenColumns(card, this.firstColumn, this.secondColumn);
            } else if (card.isComplete && this.secondColumn.includes(card)) {
                // Перемещение карточки из второго столбца в третий
                this.moveCardBetweenColumns(card, this.secondColumn, this.thirdColumn);
            }

            // Проверка на переход с 0% до 50%
            if (progress === 0 && this.secondColumn.length < 5) {
                // Перемещение карточки из первого столбца во второй
                this.moveCardBetweenColumns(card, this.firstColumn, this.secondColumn);
            }
        },
        removeCard(index) {
            this.thirdColumn.splice(index, 1);
        },
        moveCardBetweenColumns(card, fromColumn, toColumn) {
            const index = fromColumn.findIndex(c => c.id === card.id);
            if (index !== -1) {
                // Проверяем, что в secondColumn не больше 5 карточек
                if (toColumn === this.secondColumn && this.secondColumn.length >= 5) {
                    alert('Во втором столбце не может быть больше 5 карточек.');
                    return;
                }
                fromColumn.splice(index, 1);
                toColumn.push(card);
            }
        },

        addCard() {
            if (this.validateForm()) {
                const newGroup = {
                    id: Date.now(),
                    groupName: this.groupName,
                    items: [
                        { text: this.inputOne, checked: false },
                        { text: this.inputTwo, checked: false },
                        { text: this.inputThr, checked: false },
                        { text: this.inputFor, checked: false },
                        { text: this.inputFiv, checked: false },
                    ],
                    lastChecked: new Date().toLocaleString(),
                    isDisabled: false // Добавляем новое свойство для отключения карточки
                };

                // Проверяем, есть ли в firstColumn карточки с прогрессом 0%
                const cardsWithZeroProgress = this.firstColumn.filter(card => {
                    const checkedCount = card.items.filter(item => item.checked).length;
                    const progress = (checkedCount / card.items.length) * 100;
                    return progress === 0;
                });

                // Проверяем, есть ли в secondColumn карточки с прогрессом 50%
                const cardsWithFiftyProgress = this.secondColumn.filter(card => {
                    const checkedCount = card.items.filter(item => item.checked).length;
                    const progress = (checkedCount / card.items.length) * 100;
                    return progress === 50;
                });

                // Если карточек с прогрессом 0% меньше 3 и первый блок не заполнен, добавляем новую карточку
                if (cardsWithZeroProgress.length < 3 && this.firstColumn.length < 3) {
                    this.firstColumn.push(newGroup);
                    this.clearForm();
                } else if (cardsWithFiftyProgress.length >= 5) {
                    // Если карточек с прогрессом 50% больше или равно 5, отключаем перемещение карточек из первого столбца во второй
                    this.firstColumn.forEach(card => {
                        card.isDisabled = true;
                    });
                    this.errors.push('Во втором столбце не может быть больше 5 карточек с прогрессом 50%.');
                } else {
                    this.errors.push('В первом столбце не может быть больше 3 карточек.');
                }
            }
        },
        validateForm() {
            this.errors = [];
            if (!this.groupName) {
                this.errors.push('Пожалуйста, введите название карточки.');
            }
            if (!this.inputOne || !this.inputTwo || !this.inputThr || !this.inputFor) {
                this.errors.push('Пожалуйста, заполните все заметки.');
            }
            if (!this.inputFiv) { // Проверяем наличие нового пункта
                this.errors.push('Пожалуйста, заполните все заметки.');
            }
            return this.errors.length === 0;
        },
        clearForm() {
            this.groupName = null;
            this.inputOne = null;
            this.inputTwo = null;
            this.inputThr = null;
            this.inputFor = null;
        }
    },
    mounted() {
        // this.checkBlockColumn();
    }
});