import dayjs from "https://cdn.skypack.dev/dayjs";
import DOMPurify from 'https://cdn.skypack.dev/dompurify';

// find DOM elements
const body: HTMLBodyElement = document.querySelector("body")!;
const form: HTMLFormElement = document.querySelector<HTMLFormElement>(".form-control")!;
const input: HTMLInputElement = document.querySelector<HTMLInputElement>("#form-input")!;
const contentList: HTMLDivElement = document.querySelector<HTMLDivElement>(".content-list")!;
const clearButton: HTMLButtonElement = document.querySelector<HTMLButtonElement>(".content-button__clear")!;
const toItemListButton: HTMLButtonElement = document.querySelector<HTMLButtonElement>(".form-control__button-shopList")!;
const colorPickerInput: HTMLInputElement = document.querySelector("#color-picker")!;

// add event listeners
colorPickerInput.addEventListener("change", () => {
    body.style.backgroundColor = colorPickerInput.value
})
document.addEventListener("DOMContentLoaded", setupItemsList);
form.addEventListener<"submit">("submit", addItem);
clearButton.addEventListener<"click">("click", clearItems);
toItemListButton.addEventListener<"click">('click', () => {
    window.history.pushState("", "", '../assets/shopList.html');
    window.history.go();
})

// get current date and time via dayjs library
function getCurrentDatetime(): string {
    return dayjs().format('HH:mm DD.MM')
}

// create item label and value sanitize
function getItemLabel(value: string): string {
    const cleanValue = DOMPurify.sanitize(value);
    return `${cleanValue} | ${getCurrentDatetime()}`
}

// empty input field
function clearInputValue(): void {
    input.value = "";
}

// create unique id for list items
function generateUniqueId(): string {
    return Math.floor(Math.random() * 100) + dayjs().format('hhmmss')
}

// set unique id to item attribute
function setDataIdAttribute(element: HTMLDivElement): void {
    const attr: Attr = document.createAttribute("data-id");
    attr.value = generateUniqueId();
    element.setAttribute("data-id", attr.value);
}

// add new item to list
function addItem(event: Event): void {
    event.preventDefault();
    const contentItem: HTMLDivElement = document.createElement<"div">("div");
    contentItem.classList.add("content-item");
    setDataIdAttribute(contentItem);
    const contentItemTitle: HTMLParagraphElement = document.createElement<"p">("p");
    contentItemTitle.innerText = getItemLabel(input.value);

    const buttonContainer: HTMLDivElement = document.createElement<"div">("div");
    buttonContainer.classList.add("content-item__btn");

    const deleteButton: HTMLButtonElement = document.createElement<"button">("button")
    deleteButton.classList.add("content-item__btn-clean");
    deleteButton.innerText = "Clear";
    deleteButton.addEventListener<'click'>('click', deleteItem)
    buttonContainer.appendChild(deleteButton);
    contentItem.append(contentItemTitle, buttonContainer);
    contentList.insertBefore(contentItem, clearButton);
    addItemToLocalStorage({
        id: contentItem.getAttribute("data-id")!,
        value: input.value
    });
    clearInputValue();
}

// check value not included malicious characters
function isValidData(value: string | TItemsListProps[]): boolean {
    const regex: RegExp = /^[a-zA-Z0-9 ]+/
    if (typeof value === "string") {
        return regex.test(value);
    } else {
        const newArray = value.map(((val) => {
            return regex.test(val.value) && regex.test(val.id);
        }))
        return newArray.every((value) => value === true);
    }
}

interface ILocalStorageFunctionProps {
    (data: TItemsListProps): void
}

type TItemsListProps = {
    id: string,
    value: string
}

// add new item to local storage
const addItemToLocalStorage: ILocalStorageFunctionProps = (data: TItemsListProps): void => {
    const currentItem: TItemsListProps = {
        id: data.id,
        value: data.value
    };
    const items: TItemsListProps[] = getLocalStorage();
    items.push(currentItem);
    localStorage.setItem("items", JSON.stringify(items))
}

// delete item from local storage
function removeItemsFromLocalStorage(id: string): void {
    const items: TItemsListProps[] = getLocalStorage();
    const listOfItems: TItemsListProps[] = items.filter((item: TItemsListProps) => {
        return item.id !== id
    })
    localStorage.setItem("items", JSON.stringify(listOfItems));
}

// delete item from list of item
function deleteItem({target}: any): void {
    const currentItem: HTMLDivElement = target.parentNode.parentNode;
    const itemAttr = currentItem.getAttribute("data-id") || "";
    removeItemsFromLocalStorage(itemAttr);
    contentList.removeChild<Node>(currentItem);
}

function getLocalStorage(): TItemsListProps[] {
    try {
        if (isValidData(JSON.parse(localStorage.getItem("items")!))) {
            return (new Function('return' + localStorage.getItem("items")!))()
        } else {
            alert("Invalid local storage data!");
            clearItems();
            return []
        }
    } catch (err) {
        return []
    }
}

// setup items to page
export function setupItemsList(): void {
    const items: TItemsListProps[] = getLocalStorage();
    items.forEach((item: TItemsListProps) => {
        getListOfItem(item);
    })
}

// get list item from local storage
const getListOfItem: ILocalStorageFunctionProps = (data: TItemsListProps): void => {
    const contentItem: HTMLDivElement = document.createElement("div");
    contentItem.setAttribute("data-id", data.id)
    contentItem.classList.add("content-item");

    const contentItemTitle: HTMLParagraphElement = document.createElement("p");
    contentItemTitle.innerText = getItemLabel(data.value);

    const buttonContainer: HTMLDivElement = document.createElement("div");
    buttonContainer.classList.add("content-item__btn");

    const deleteButton: HTMLButtonElement = document.createElement("button")
    deleteButton.classList.add("content-item__btn-clean");
    deleteButton.innerText = "Clear";
    deleteButton.addEventListener<'click'>('click', deleteItem)
    buttonContainer.appendChild<HTMLButtonElement>(deleteButton);
    contentItem.append(contentItemTitle, buttonContainer);
    contentList.insertBefore(contentItem, clearButton);
}

// clear list item from page and local storage
function clearItems(): void {
    const items: NodeListOf<HTMLDivElement> = document.querySelectorAll('.content-item');
    localStorage.removeItem("items");
    items.forEach((item: HTMLDivElement) => {
        item.remove();
    })
    clearInputValue();
}