CREATE TABLE site_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TRIGGER trg_site_policies_updated_at
    BEFORE UPDATE ON site_policies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO site_policies (id, policy_key, title, content) VALUES
(
    'a1000001-0000-4000-8000-000000000001',
    'PRIVACY',
    'Privacy Policy',
    $privacy$This privacy policy sets out how Gamya Couture uses and protects any information that you give Gamya Couture when you visit their website and/or agree to purchase from them.

Gamya Couture is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.

Gamya Couture may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.

Information we collect
We may collect the following information:
- Name
- Contact information including email address
- Demographic information such as postcode, preferences and interests, if required
- Other information relevant to customer surveys and/or offers

What we do with the information we gather
We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
- Internal record keeping.
- We may use the information to improve our products and services.
- We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.
- From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.

Security
We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.

How we use cookies
A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.

We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.

Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.

You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.

Controlling your personal information
You may choose to restrict the collection or use of your personal information in the following ways:
- whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes
- if you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at gamyacouture9@gmail.com

We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.$privacy$
),
(
    'a1000001-0000-4000-8000-000000000002',
    'RETURN',
    'Return Policy',
    $return$Slight color differences due to photography resolution is not acceptable for exchange. We always gives best quality and best price. so no returns accepted. In case of damage, exchange accepted only with proper open video proof without cut or pause. It is compulsory for attending incase any complaints.

You have to return the parcel within 4 days once received incase if exchange accepted.. whereas shipping charge 60 to 100 will be given from our side.

Once refund initiated you will receive the amount within 5 to 7 working days.$return$
),
(
    'a1000001-0000-4000-8000-000000000003',
    'SHIPPING',
    'Shipping Policy',
    $shipping$Within India
No cod. Only online payment. Shipping is extra unless if mentioned as free shipping

Generally we will dispatch the Saree within 3 to 7 working days, Kindly wait for transit time. For dyable sarees like warm silk, viscose georgette, customised sarees, dispatch takes two more days extra to complete polishing. If it is not delivered within 8 days, please inform us, we will send you tracking information. Maximum you will receive the product in 7 to 15 working days

If any delay in courier happens. Please give us sometime to solve the issue by raising complaint. Don't claim immediate refund.

Please note: During festival seasons such as Diwali, Pongal, Ramzan, and Bakrid, manufacturing operations will be temporarily paused due to worker holidays. We kindly request that you refrain from placing urgent or committed orders during this time. Additionally, please expect a one-week delay in delivery for orders placed during the festival period.

For overseas customers
Please do whatsapp to +91 79952 29463 before placing your order for shipping details and availability.$shipping$
);
