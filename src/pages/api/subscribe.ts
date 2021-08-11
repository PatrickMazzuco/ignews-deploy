import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { query as q } from 'faunadb';

import { fauna } from '../../services/fauna';
import { stripe } from '../../services/stripe';

interface User {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
}

const subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('user_email'), q.Casefold(session.user.email)))
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      // Create stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        // metadata
      });

      customerId = stripeCustomer.id;

      // Save customer id to FaunaDB
      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: customerId,
          },
        })
      );
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: 'price_1JF3IVBaQeg1ECT2XOqHjv16',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
};

export default subscribe;
