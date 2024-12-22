import { ChargeBee, _customer } from 'chargebee-typescript';
import { Request, Response } from "express"

import { PrismaClient as PrismaClientMain } from "../prisma/generated/client_main";
const prisma = new PrismaClientMain();
  
var chargebee = new ChargeBee();
  
chargebee.configure({site : process.env.CHARGEBEE_SITE, api_key : process.env.CHARGEBEE_API});

export async function getSubscriptions(req: Request, res: Response) {
    const userId = parseInt(req.params.userId as string);
    const user = await prisma.users.findFirst({
        where: {
            id: userId
        },
        select: {
            firstName: true,
            lastName: true,
            email: true
        }
    });

    chargebee.customer.list({
        first_name : { is : user?.firstName },
        last_name : { is : user?.lastName },
        email : { is : user?.email }
    }).request(function(error: any, result: any) {
        if(error || result.list.length !== 1){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            const customerId = result.list[0].customer.id;
            chargebee.subscription.list({
                customer_id : { is : customerId }
            }).request(function(error: any, result: any) {
                if(error || result.list.length !== 1){
                    //handle error
                    console.log('error:', error);
                    res.status(500).send('Internal server error');
                }else{
                    const output: any = {};
                    const entry = result.list[0];
                    output['subscription'] = entry.subscription;
                    output['customer'] = entry.customer;
                    output['card'] = entry.card;
                    res.status(200).send(output);
                }
            });
        }
    });
}

export async function updateBillingAccount(req: Request, res: Response) {
    const customerId = req.params.customerId;
    const { firstName, lastName, address1, address2, address3, zip, country, state, city, email, phone } : { firstName: string, lastName: string, address1: string, address2: string, address3: string, zip: string, country: string, state: string, city: string, email: string, phone: string } = req.body
    chargebee.customer.update_billing_info(customerId,{
        billing_address : {
            first_name : firstName,
            last_name : lastName,
            line1 : address1,
            line2 : address2,
            line3 : address3,
            zip : zip,
            country : country,
            state : state,
            city : city,
            email: email,
            phone: phone         
        }
    }).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            // console.log(`${result}`);
            res.status(200).send(result.customer);
        }
    });
}

export async function updateBillingFreq(req: Request, res: Response) {
    const subscriptionId = req.params.subscriptionId;
    const { newPlanId, quantity } : { newPlanId: string, quantity: number } = req.body

    chargebee.subscription.update_for_items(subscriptionId,{
        invoice_immediately : true,
        change_option: 'end_of_term',
        subscription_items : [
            {
                item_price_id : newPlanId,
                quantity: quantity
            }]
        }).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            chargebee.subscription.retrieve_with_scheduled_changes(
                subscriptionId
            ).request(function(error: any, result: any) {
                if(error){
                    //handle error
                    console.log('error:', error);
                    res.status(500).send('Internal server error');
                }else{
                    res.status(200).send(result.subscription);
                }
            });
        }
    });
}

export async function getScheduledSubscription(req: Request, res: Response) {
    const subscriptionId = req.params.subscriptionId;
    chargebee.subscription.retrieve_with_scheduled_changes(
        subscriptionId
    ).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            res.status(200).send(result.subscription);
        }
    });
}

export async function cancelScheduledChanges(req: Request, res: Response) {
    const subscriptionId = req.params.subscriptionId;
    chargebee.subscription.remove_scheduled_changes(
        subscriptionId
    ).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            res.status(200).send(result.subscription);
        }
    });
}

export async function getItemPrices(req: Request, res: Response) {
    const planId = req.params.planId;
    let itemPrices: any[] = [];
    chargebee.item_price.retrieve(planId.concat('-monthly')).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            itemPrices.push({
                unit: 'monthly',
                itemPrice: result.item_price.price,
                currency: result.item_price.currency_code
            });
            chargebee.item_price.retrieve(planId.concat('-yearly')).request(function(error: any, result: any) {
                if(error){
                    //handle error
                    console.log('error:', error);
                    res.status(500).send('Internal server error');
                }else{
                    itemPrices.push({
                        unit: 'yearly',
                        itemPrice: result.item_price.price,
                        currency: result.item_price.currency_code
                    });
                    res.status(200).send(itemPrices);
                }
            });
        }
    });
}

export async function getPaymentMethods(req: Request, res: Response) {
    const customerId = req.params.customerId;
    chargebee.payment_source.list({
        customer_id : { is : customerId },
        status: { is : "valid" },
        "sort_by[asc]" : "created_at"
    }).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            let sources: any[] = [];
            for(var i = 0; i < result.list.length;i++){
                var entry=result.list[i]
                sources.push(entry.payment_source);
            }
            res.status(200).send(sources);
        }
    });
}

export async function updatePaymentMethod(req: Request, res: Response) {
    const customerId = req.params.customerId;
    const { paymentSourceId } : { paymentSourceId: string } = req.body
    chargebee.customer.assign_payment_role(customerId,{
        payment_source_id : paymentSourceId,
        role: 'PRIMARY'
    }).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            res.status(200).send(result.payment_source);
        }
    });
}

export async function removePaymentMethod(req: Request, res: Response) {
    const paymentSourceId = req.params.paymentSourceId;
    chargebee.payment_source.delete_local(paymentSourceId).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            res.status(200).send('Success');
        }
    });
}

export async function managePaymentSourcesHosted(req: Request, res: Response) {
    const customerId = req.params.customerId;
    chargebee.hosted_page.manage_payment_sources ({
        customer : {
            id : customerId
        },
        card : {
            gateway_account_id : process.env.CHARGEBEE_STRIPE_GATEWAY
        },
        redirect_url : process.env.FRONTEND_URL + '/AdminCenter#billing'
    }).request(function(error: any, result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            res.status(200).send(result.hosted_page);
        }
    });
}

export async function cancelSubscription(req: Request, res: Response) {
    const subscriptionId = req.params.subscriptionId;
    chargebee.subscription.cancel_for_items(subscriptionId,{
        end_of_term : true
    }).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            // console.log(`${result}`);
            var subscription: typeof chargebee.subscription = result.subscription;
            res.status(200).send(subscription);
        }
        });
}

export async function unCancelSubscription(req: Request, res: Response) {
    const subscriptionId = req.params.subscriptionId;
    chargebee.subscription.remove_scheduled_cancellation(subscriptionId).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
        //   console.log(`${result}`);
            var subscription: typeof chargebee.subscription = result.subscription;
            res.status(200).send(subscription);
        }
    });
}

export async function editSubscriptionHosted(req: Request, res: Response) {
    const subscriptionId = req.params.subscriptionId;
    const { planId, quantity } : { planId: string, quantity: number } = req.body;
    chargebee.hosted_page.checkout_existing_for_items({
        subscription : {
            id : subscriptionId
            },
        subscription_items : [
            {
                item_price_id : planId,
                quantity : quantity
            }
        ],
        redirect_url : process.env.FRONTEND_URL + '/AdminCenter#billing',
        cancel_url : process.env.FRONTEND_URL + '/AdminCenter#billing',
        layout : 'full_page'
    }).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            res.status(200).send(result.hosted_page);
        }
    });
}

export async function getAllItemPrices(req: Request, res: Response) {
    chargebee.item_price.list({
        limit: 100
    }).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            let itemPrices: { [key: string]: any } = {};
            for(var i = 0; i < result.list.length; i++){
                var entry=result.list[i]
                itemPrices[entry.item_price.id.toLowerCase()] = entry.item_price;
            }
            res.status(200).send(itemPrices);
        }
    });
}

export async function refundCreditNotes(req: Request, res: Response) {
    const customerId = req.params.customerId;
    chargebee.credit_note.list({
        customer_id : { is : customerId },
        type : { is: "refundable"},
        "sort_by[asc]" : "date",
        status : { is : "refund_due" }
    }).request(function(error: any,result: any) {
        if(error){
            //handle error
            console.log('error:', error);
            res.status(500).send('Internal server error');
        }else{
            for(var i = 0; i < result.list.length; i++){
                var entry=result.list[i].credit_note;
                chargebee.credit_note.refund(entry.id,{
                    customer_notes : "Refunded through admin console",
                }).request(function(error: any, result : any) {
                    if(error){
                        //handle error
                        console.log(error);
                        res.status(500).send('Internal server error');
                    }else{
                        //do nothing
                    }
                  });
            }
            res.status(200).send("success");
        }
    });
}