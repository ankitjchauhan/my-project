README – Dynamic Product Filter with Dropdown

1. Title of the Experiment

Dynamic Product Filter with Dropdown using JavaScript DOM Manipulation

2. Objective

To build a product list on a webpage that dynamically updates based on the category selected from a dropdown menu.
This experiment aims to practice:
DOM manipulation with JavaScript
Event handling (change event on dropdown)
Dynamic filtering and display updates without reloading the page

3. Tools and Technologies Used

HTML5 → To create the product list and dropdown structure
CSS3 → To style the layout and make the list visually neat
JavaScript → To implement the filtering logic and manipulate the DOM
Web Browser → To test and run the web application

4. Theory Behind the Experiment

Dropdown Menus:

A <select> element is used to provide category options such as All, Clothing, Electronics, Books.
The change event is triggered when the user selects a new option.
DOM Manipulation with JavaScript:
Each product is given a category (via data-category attribute).
JavaScript reads the selected category and compares it with product categories.
Products are shown (display: block) or hidden (display: none) accordingly.
Dynamic Updates:
Filtering happens instantly in the browser without refreshing the page.

5. Step-by-Step Procedure

Step 1: Create HTML Structure

Add a <h2> heading “Product List”.
Create a <select> dropdown with options like All, Clothing, Electronics, Books.
Define a product list with <div> or <li> elements, each tagged with a data-category attribute.

Step 2: Apply Basic CSS

Add borders around the product list area.
Give padding/margins for readability.

Step 3: Write JavaScript Filtering Logic

Select the dropdown element with getElementById.
Attach a change event listener.
Inside the event handler:
Get the selected value.
Loop through all products.
If the selected category matches the product’s data-category (or if “All” is chosen), show the product; otherwise, hide it.

Step 4: Test Filtering

Select All → all products should display.
Select Clothing → only “T-Shirt” and “Jeans” should display.
Select Books → only “Novel” and “Cookbook” should display.
Select Electronics → only “Headphones” and “Smartphone” should display.

6. Expected Output

A product list displayed on the webpage.
Dropdown filter above the list.
When a category is chosen, only products belonging to that category appear instantly.
When “All” is selected, the full list reappears.

7. Learning Outcomes

Creating Dropdowns in HTML
Using Data Attributes to Store Category Information
Handling Dropdown Change Events in JavaScript
Filtering and Updating DOM Elements Dynamically
Controlling Element Visibility using CSS (display property)
Building Interactive User Interfaces