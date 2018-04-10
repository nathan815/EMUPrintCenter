<template>
    <section class="section orders">

        <header>
            <h2 class="pull-left">
                Orders
                <select>
                    <option>All</option>
                    <option>Not Paid</option>
                    <option>Paid</option>
                </select>
            </h2>
            <button class="btn pull-right"><i class="fas fa-plus"></i> Add Email Order</button>
        </header>
        
        <div class="order">
            <header>
                <h3 class="pull-left">Order #1</h3>
                <span class="header-details pull-right">
                    <span class="paid not">Hasn't Paid</span> 
                    <br>
                    <a href="#"><i class="fas fa-dollar-sign"></i> Begin Payment</a>
                </span>
            </header>
            <div class="details">
                <p class="contact"><i>Contact:</i> John Doe &bull; john@doe.com</p>
                <p class="notes"><i>Notes:</i> they want this, and that, and that</p>
                <div class="items">
                    <h4>Items in this order</h4>
                   <item-table :show-total-row="true" :show-placeholder="false"></item-table>
                </div>
            </div><!-- end .details-->
        </div><!-- end .order-->

    </section><!-- end section.orders-->
</template>
