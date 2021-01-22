/* Budget controller */
var budgetController = (function() {
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalInc){
        if(totalInc > 0){
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value
        });

        data.totals[type] = sum;
    }

    
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            // create new id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }

            // create new itam
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            } 

            //push into data structure
            data.allItems[type].push(newItem);
            // return new element
            return newItem;
        },

        // delete item

        deleteItem: function(type, id){
            // DataCue.allItems[type][id]
            var ids, index;

            var ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp /  data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
    

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur) {
                current.calculatePercentage()
            })
        },

        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data)
        }
    };
})();







/* User interface controller */
var UIController = (function(){
    
    // store strings for easy changes
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        sumBtn: '.sum_btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        curYear: '.budget__title--month'
    };


    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            var html, newHtml, element

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === 'exp'){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription +',' + DOMstrings.inputValue)
            
            // convert to arr
             fieldsArr = Array.prototype.slice.call(fields);

             fieldsArr.forEach(function(current, index, array){
                 current.value = "";
             });
             fieldsArr[0].focus();
        },

        // display budget
        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayMonth: function(){
            year = new Date().getFullYear();
            document.querySelector(DOMstrings.curYear).textContent = year;
            // console.log(year);
        },
        // expose dom strings
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
})();








/*  Global App controller */
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.sumBtn).addEventListener('click',ctrlAddItem);
        // adding for enter key
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctlDeleteItem);
    };
    
    var updateBudget = function(){
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function(){
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages 
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI 
        console.log(percentages);
    };

    var ctrlAddItem =function(){
        var input, newItem;
        // 1. Get the field input data
         input = UIController.getInput();

         if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. clear fields
            UICtrl.clearFields()
            
            //5. calculate and update budget
            updateBudget()
            // 6. Update percentages
            UICtrl.updatePercentages();
         }        
    };

    var ctlDeleteItem = function(event){
        var itemID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete from DS
            budgetCtrl.deleteItem(type, ID);

            // delete from UI
            UICtrl.deleteListItem(itemID);
            // update and show the new budget
            updateBudget()
            // 4. Update percentages
            UICtrl.updatePercentages();
        }
    }

    return {
        init: function(){
            console.log('App has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    
    
})(budgetController, UIController);

// return init

controller.init()

// Josh codes