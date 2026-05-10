I want to create a web app for printing shop.
Tech stock - 
Front end React,
Back end fast api,
Database - use SQLite for now. In future i amy change it to different db


 

## Business use cases
The default page should display about Business - like we can Design and print the customised Greeting cards,
Billbooks etc., in best disconunted price.

User can select products menu or icon and see list of available products.
Products ex - Visiting Cards, Bill Books, Greeting Cards etc. admin can able to configure this products

Customers can able to login to the application using Google authentication . Once authenticated user should be able to select Retail User or B2B user. It should be configurable.. because based on user time we provide the different offers via admin screen.
Once logged see the available products with price details
Products ex - Visiting Cards, Bill Books, Greeting Cards etc.,

If they select a product (ex: visiting card)
Then it should display the available templates where user can select and add to cart.
Also user can able to upload thir custom template and upload it as image and add to cart.
Image should have specific configurable limit. API should validate the virus and upload it 

Then user can select the CART and navigate to the product list page and confirm and go for the payment.
For now we provide Google pay option. Or user can selecct pay later also .

before doing user should give mobile number and contact address. This is specifically for india and you give default option as tamil nadu



These order details should be saved in Table. Client and address details also should be saved
If the same user comes again then prepopulate the address and if the user want they can add new address and mark the default address also.


--

Admin part
----------
if the user enters  /admin then it should it should allow the user to register the admin user. but shuould not login immediatly. The notification should sent to the pre configured email id with approve link. if the user approves then only the admin user should get approved can perform the action.

admin user can add/udpate/delete the product. Give discount based on the customer 
View the orders. And track the status like - Pending/inprogress, completed. each setp they should give some command. And able to maintian the payment status also for each order



NOTE : Applicaiton should follow the best security practices

