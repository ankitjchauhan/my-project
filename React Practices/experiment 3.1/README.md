Project: ProductCard Component Using Props

Aim : 

To create a reusable React component that displays product details dynamically. This project demonstrates how to pass data from a parent component to a child component using props.


Objectives : 
Develop a single, reusable ProductCard component.
Utilize props to pass different product data (name, price, stock status) to the component.
Render multiple instances of the same ProductCard component, each displaying unique data.
Style the components to create a clean, card-based layout.


Description : 
This simple React application consists of two main parts: a parent component (App) and a child component (ProductCard). The parent component holds the data for three different products. Instead of writing separate code for each product's display, we create a single, generic ProductCard component. The App component then calls the ProductCard component multiple times, passing the specific product details for each card as props. This approach showcases the power of reusability and dynamic rendering in React.


Procedure/Steps : 

Create the ProductCard Component: In App.jsx, define a function component named ProductCard that accepts a props object as its argument.

Destructure Props: Inside the ProductCard component, destructure the name, price, and status properties from the props object for easier access.

Create the JSX Structure: Write the JSX code for the product card, including elements like h3 for the name and p tags for the price and status.

Style the Components: In App.css, add styles for the main container, the products list, and the individual product-card to match the desired layout and appearance.

Render Multiple Cards: In the main App component, render three instances of the ProductCard component.

Pass Data via Props: For each ProductCard instance, pass the unique product data as attributes (e.g., <ProductCard name="Wireless Mouse" price="25.99" status="In Stock" />). React automatically collects these attributes into the props object received by the component.




Results : 
The result is a clean and organized product list with three distinct cards, each displaying different data. The component structure is efficient and scalable; if we wanted to add a fourth product, we would simply add another ProductCard component with its own props, without changing the component's core logic.





Learning Outcomes : 


Understanding Props: Gained a practical understanding of how props are used to pass data from a parent component to a child component in React.

Component Reusability: Learned to create a single, reusable component that can be used multiple times with different data, significantly reducing code duplication.

Dynamic Rendering: Discovered how React can render dynamic data, making the UI interactive and data-driven.

Separation of Concerns: Practiced separating the component logic (App.jsx) from its styling (App.css), which is a fundamental principle of clean code.
