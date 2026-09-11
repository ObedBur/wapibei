export const SUPPORTED_LANGUAGES = ['fr', 'en', 'sw'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export type Translations = {
  [K in Language]: Record<string, string>;
};

export const TRANSLATIONS: Translations = {
  fr: {
    // ── Emails ─────────────────────────────────────────────
    'email.otp.subject': 'Votre code de vérification WapiBei',
    'email.otp.title': 'Vérifiez votre adresse e-mail',
    'email.otp.body':
      'Merci de nous avoir rejoint. Pour finaliser la configuration de votre compte, veuillez saisir le code de validation suivant :',
    'email.otp.validity': 'Valable pendant 10 minutes',
    'email.otp.ignore':
      "Si vous n'avez pas créé de compte sur WapiBei, vous pouvez ignorer cet e-mail en toute sécurité.",
    'email.otp.footer': 'Plateforme de shopping local.',
    'email.otp.help': 'Besoin d\u2019aide ?',
    'email.otp.helpLink': 'Contactez le support',

    'email.reset.subject': 'Réinitialisation de votre mot de passe WapiBei',
    'email.reset.title': 'Réinitialisation de mot de passe',
    'email.reset.greeting': 'Bonjour,',
    'email.reset.body':
      'Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :',
    'email.reset.cta': 'Réinitialiser mon mot de passe',
    'email.reset.warning':
      "Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette action, aucune mesure n'est nécessaire.",
    'email.reset.footer': 'Tous droits réservés.',

    'email.bulk.subject': '🛍️ Votre commande WapiBei est validée !',
    'email.bulk.header': 'Commande Confirmée',
    'email.bulk.greeting': 'Bonjour {name},',
    'email.bulk.body':
      'Bonne nouvelle ! Votre commande a bien été reçue. Voici le récapitulatif de vos achats sur WapiBei :',
    'email.bulk.thImage': 'Image',
    'email.bulk.thDetails': 'Détails',
    'email.bulk.thQty': 'Qté',
    'email.bulk.thAmount': 'Montant',
    'email.bulk.total': 'MONTANT TOTAL :',
    'email.bulk.noteTitle': 'Note importante :',
    'email.bulk.note':
      'Les vendeurs ont été notifiés et vous contacteront directement pour organiser les détails de la livraison.',
    'email.bulk.thanks':
      "Merci d'avoir choisi WapiBei pour votre shopping local !",

    'email.vendor.subject': 'Nouvelle vente sur WapiBei : {product}',
    'email.vendor.header': '🎉 NOUVELLE COMMANDE !',
    'email.vendor.greeting': 'Félicitations {name},',
    'email.vendor.body':
      "Une nouvelle vente vient d'être réalisée dans votre boutique :",
    'email.vendor.ref': 'Réf:',
    'email.vendor.customerTitle': 'Coordonnées du client',
    'email.vendor.nameLabel': 'Nom :',
    'email.vendor.phoneLabel': 'Tél :',
    'email.vendor.cta': 'Contactez le client pour organiser la livraison.',

    'email.admin.subject': 'ADMIN : Nouvelle vente plateforme - {customer}',
    'email.admin.title': 'Tableau de bord Admin',
    'email.admin.body':
      "Une nouvelle commande vient d'être passée sur WapiBei.",
    'email.admin.client': 'Client :',
    'email.admin.items': 'Articles :',
    'email.admin.total': 'Total :',
    'email.admin.productsTitle': 'Produits commandés :',
    'email.admin.footer': 'Auto-notification WapiBei Engine',

    'email.welcome.subject': 'Bienvenue chez WapiBei, {name} ! 🟠',
    'email.welcome.subtitle': "Le marché intelligent de l'Afrique",
    'email.welcome.greeting': 'Bonjour {name},',
    'email.welcome.title': 'Heureux de vous voir parmi nous !',
    'email.welcome.body':
      'Votre compte est maintenant actif. Vous faites désormais partie de l\u2019écosystème WapiBei, où vous pouvez comparer les prix, suivre vos vendeurs préférés et dénicher les meilleures offres en un clic.',
    'email.welcome.whatYouCanDo': 'Ce que vous pouvez faire :',
    'email.welcome.f1': 'Comparer les prix en Afrique en temps réel.',
    'email.welcome.f2': 'Suivre vos boutiques préférées.',
    'email.welcome.f3':
      'Acheter en toute confiance avec les scores de confiance.',
    'email.welcome.cta': 'EXPLORER LES PRODUITS',
    'email.welcome.footer': '© 2026 WapiBei Tech. Tous droits réservés.',

    'email.pricedrop.subject': 'Baisse de prix sur {product} !',
    'email.pricedrop.badge': 'Alerte Prix',
    'email.pricedrop.title': "C'est le moment d'acheter !",
    'email.pricedrop.cta': "VOIR L'OFFRE",

    'email.cart.subject':
      '{name}, vous avez oublié des articles dans votre panier !',
    'email.cart.title': 'Oops !',
    'email.cart.body':
      'Il semblerait que vous ayez laissé {count} article(s) dans votre panier.',
    'email.cart.cta': 'FINALISER MA COMMANDE',

    'email.closure.subject': 'Transaction Clôturée : {orderId}',
    'email.closure.title': 'RAPPORT DE CLÔTURE',
    'email.closure.body':
      'La transaction suivante a été marquée comme terminée sur WapiBei.',
    'email.closure.orderId': 'N° Commande :',
    'email.closure.client': 'Client :',
    'email.closure.vendor': 'Vendeur :',
    'email.closure.product': 'Produit :',
    'email.closure.amount': 'Montant Net :',
    'email.closure.footer': 'WapiBei Monitoring Sys',

    'email.newproduct.subject': '🌟 Nouveau chez {vendor} : {product}',
    'email.newproduct.title': 'Nouveauté !',
    'email.newproduct.greeting': 'Bonjour {name},',
    'email.newproduct.body':
      'Une boutique que vous suivez, {vendor}, vient de publier un nouvel article :',
    'email.newproduct.cta': 'VOIR LE PRODUIT',
    'email.newproduct.footer':
      'Vous recevez cet email car vous suivez cette boutique sur WapiBei.',

    'email.confirmed.subject': 'Commande confirmée — {product}',
    'email.confirmed.title': 'Commande confirmée !',
    'email.confirmed.greeting':
      'Bonjour {name}, Bonne nouvelle ! Le vendeur {vendor} a confirmé votre commande.',
    'email.confirmed.productLabel': 'Produit commandé',
    'email.confirmed.ref': 'Réf.',
    'email.confirmed.body':
      'Votre commande est en cours de préparation. Vous recevrez une notification dès qu\u2019elle sera expédiée.',
    'email.confirmed.footer': 'L\u2019Afrique qui achète et qui vend',

    'email.shipped.subject': 'Votre colis est en route — {product}',
    'email.shipped.title': 'Votre colis est en route !',
    'email.shipped.greeting':
      '{vendor} vient d\u2019expédier votre commande. Elle est maintenant en chemin vers vous !',
    'email.shipped.productLabel': 'Produit expédié',
    'email.shipped.addressLabel': 'Adresse de livraison',
    'email.shipped.body':
      'En cas de problème avec votre livraison, contactez le vendeur directement via la plateforme.',
    'email.shipped.footer': 'L\u2019Afrique qui achète et qui vend',

    'email.cancelled.subject': 'Commande annulée — {product}',
    'email.cancelled.title': 'Commande annulée',
    'email.cancelled.greeting':
      'Nous sommes désolés. Votre commande auprès de {vendor} a été annulée.',
    'email.cancelled.productLabel': 'Commande annulée',
    'email.cancelled.ref': 'Réf.',
    'email.cancelled.body':
      'Si vous pensez qu\u2019il s\u2019agit d\u2019une erreur, contactez notre support ou cherchez un autre vendeur proposant ce produit sur WapiBei.',
    'email.cancelled.footer': 'L\u2019Afrique qui achète et qui vend',

    // ── SMS ────────────────────────────────────────────────
    'sms.orderClient':
      'WapiBei: Votre commande de {count} article(s) pour {total} $ a bien été envoyée. Le vendeur vous contactera sous peu.',
    'sms.orderVendor':
      'WapiBei: Nouvelle commande de {customer} ({total} $). Produit(s): {products}. Tel: {phone}. Adresse: {address}.',
    'sms.newProduct':
      'WapiBei: {vendor} a publié "{product}". Voir: {url}',
    'sms.orderConfirmed': 'WapiBei: Votre commande {orderId} a été confirmée par le vendeur.',
    'sms.orderShipped': 'WapiBei: Votre commande {orderId} est en cours de livraison.',
    'sms.orderDelivered': 'WapiBei: Votre commande {orderId} a été livrée. Profitez-en bien !',

    // ── WhatsApp ───────────────────────────────────────────
    'whatsapp.order.header': '*Nouvelle commande sur WapiBei*',
    'whatsapp.order.client': '*Client :* {name}',
    'whatsapp.order.tel': '*Tel :* {phone}',
    'whatsapp.order.address': '*Adresse :* {address}',
    'whatsapp.order.product': '*Produit :* {product}',
    'whatsapp.order.total': '*Total :* {total} $',
    'whatsapp.order.photo': '*Photo :* {url}',
    'whatsapp.order.link': '*Voir le produit :* {url}',
    'whatsapp.order.cta': '_Veuillez contacter le client pour confirmer la livraison._',
    'whatsapp.admin': 'ALERTE ADMIN : Nouvelle commande de {customer} ({total} $).',

    // ── Notifications in-app ───────────────────────────────
    'notif.status.confirmed.title': 'Commande confirmée',
    'notif.status.confirmed.msg': '{vendor} a confirmé votre commande pour "{product}".',
    'notif.status.shipped.title': 'Colis en route',
    'notif.status.shipped.msg': 'Votre produit "{product}" a été expédié par {vendor}.',
    'notif.status.delivered.title': 'Colis livré',
    'notif.status.delivered.msg': 'Votre "{product}" a été livré. Profitez-en bien !',
    'notif.status.cancelled.title': 'Commande annulée',
    'notif.status.cancelled.msg': 'Votre commande pour "{product}" a été annulée.',
    'notif.newProduct.title': 'Nouveau produit',
    'notif.newProduct.message': '{vendor} a publié : {product}',
    'notif.newProduct.body': '{vendor} a publié : {product}',
    'notif.vendorDefault': 'Un vendeur',
    'notif.orderCreated.client': 'Commande envoyée',
    'notif.orderCreated.clientMessage':
      'Votre commande de {count} article(s) pour un total de {total} $ a bien été envoyée au vendeur.',
    'notif.orderCreated.clientPush':
      'Votre commande a été transmise au vendeur pour confirmation.',
    'notif.orderCreated.vendor': 'Nouvelle vente',
    'notif.orderCreated.vendorMessage':
      'Vous avez reçu une commande de {customer} pour {count} article(s).',
    'notif.orderCreated.vendorPush':
      'Une nouvelle commande de {customer} attend votre validation.',
    'notif.abandonedCart.title': 'Panier en attente',
    'notif.abandonedCart.message':
      'Vous avez laissé {count} article(s) dans votre panier ! Finalisez votre commande maintenant.',
    'notif.penalty.title': 'Retard de validation',
    'notif.penalty.message':
      'Votre TrustScore a été réduit pour inactivité sur la commande de {name}.',
    'notif.lowStock.title': 'Alerte Stock Bas',
    'notif.lowStock.message':
      'Il ne reste plus que {count} exemplaire(s) de "{product}".',
    'notif.lowStock.pushTitle': 'Stock presque épuisé',
    'notif.lowStock.pushBody': 'Plus que {count} "{product}" en stock.',
    'notif.orderAdmin.title': 'Nouvelle commande plateforme',
    'notif.orderAdmin.message': '{customer} a commandé {count} article(s) ({total} $).',
  },
  en: {
    'email.otp.subject': 'Your WapiBei verification code',
    'email.otp.title': 'Verify your email address',
    'email.otp.body':
      'Thank you for joining us. To finish setting up your account, please enter the following validation code:',
    'email.otp.validity': 'Valid for 10 minutes',
    'email.otp.ignore':
      'If you did not create an account on WapiBei, you can safely ignore this email.',
    'email.otp.footer': 'Local shopping platform.',
    'email.otp.help': 'Need help?',
    'email.otp.helpLink': 'Contact support',

    'email.reset.subject': 'Reset your WapiBei password',
    'email.reset.title': 'Password reset',
    'email.reset.greeting': 'Hello,',
    'email.reset.body':
      'You requested a password reset. Click the button below to create a new password:',
    'email.reset.cta': 'Reset my password',
    'email.reset.warning':
      'This link expires in 1 hour. If you did not request this action, no action is needed.',
    'email.reset.footer': 'All rights reserved.',

    'email.bulk.subject': '🛍️ Your WapiBei order is confirmed!',
    'email.bulk.header': 'Order Confirmed',
    'email.bulk.greeting': 'Hello {name},',
    'email.bulk.body':
      'Good news! Your order has been received. Here is the summary of your purchases on WapiBei:',
    'email.bulk.thImage': 'Image',
    'email.bulk.thDetails': 'Details',
    'email.bulk.thQty': 'Qty',
    'email.bulk.thAmount': 'Amount',
    'email.bulk.total': 'TOTAL AMOUNT:',
    'email.bulk.noteTitle': 'Important note:',
    'email.bulk.note':
      'The sellers have been notified and will contact you directly to arrange delivery details.',
    'email.bulk.thanks': 'Thank you for choosing WapiBei for your local shopping!',

    'email.vendor.subject': 'New sale on WapiBei: {product}',
    'email.vendor.header': '🎉 NEW ORDER!',
    'email.vendor.greeting': 'Congratulations {name},',
    'email.vendor.body': 'A new sale has just been made in your store:',
    'email.vendor.ref': 'Ref:',
    'email.vendor.customerTitle': 'Customer details',
    'email.vendor.nameLabel': 'Name:',
    'email.vendor.phoneLabel': 'Phone:',
    'email.vendor.cta': 'Contact the customer to arrange delivery.',

    'email.admin.subject': 'ADMIN: New platform sale - {customer}',
    'email.admin.title': 'Admin Dashboard',
    'email.admin.body': 'A new order has just been placed on WapiBei.',
    'email.admin.client': 'Customer:',
    'email.admin.items': 'Items:',
    'email.admin.total': 'Total:',
    'email.admin.productsTitle': 'Ordered products:',
    'email.admin.footer': 'WapiBei Auto-notification Engine',

    'email.welcome.subject': 'Welcome to WapiBei, {name}! 🟠',
    'email.welcome.subtitle': 'Africa\u2019s smart marketplace',
    'email.welcome.greeting': 'Hello {name},',
    'email.welcome.title': 'Happy to have you with us!',
    'email.welcome.body':
      'Your account is now active. You are now part of the WapiBei ecosystem, where you can compare prices, follow your favorite sellers and find the best deals in one click.',
    'email.welcome.whatYouCanDo': 'What you can do:',
    'email.welcome.f1': 'Compare prices across Africa in real time.',
    'email.welcome.f2': 'Follow your favorite stores.',
    'email.welcome.f3': 'Shop with confidence using trust scores.',
    'email.welcome.cta': 'EXPLORE PRODUCTS',
    'email.welcome.footer': '© 2026 WapiBei Tech. All rights reserved.',

    'email.pricedrop.subject': 'Price drop on {product}!',
    'email.pricedrop.badge': 'Price Alert',
    'email.pricedrop.title': "It's time to buy!",
    'email.pricedrop.cta': 'VIEW OFFER',

    'email.cart.subject':
      '{name}, you forgot items in your cart!',
    'email.cart.title': 'Oops!',
    'email.cart.body': 'It looks like you left {count} item(s) in your cart.',
    'email.cart.cta': 'COMPLETE MY ORDER',

    'email.closure.subject': 'Closed Transaction: {orderId}',
    'email.closure.title': 'CLOSURE REPORT',
    'email.closure.body': 'The following transaction was marked as completed on WapiBei.',
    'email.closure.orderId': 'Order No:',
    'email.closure.client': 'Customer:',
    'email.closure.vendor': 'Vendor:',
    'email.closure.product': 'Product:',
    'email.closure.amount': 'Net Amount:',
    'email.closure.footer': 'WapiBei Monitoring Sys',

    'email.newproduct.subject': '🌟 New from {vendor}: {product}',
    'email.newproduct.title': 'New!',
    'email.newproduct.greeting': 'Hello {name},',
    'email.newproduct.body':
      'A store you follow, {vendor}, just published a new item:',
    'email.newproduct.cta': 'VIEW PRODUCT',
    'email.newproduct.footer':
      'You are receiving this email because you follow this store on WapiBei.',

    'email.confirmed.subject': 'Order confirmed — {product}',
    'email.confirmed.title': 'Order confirmed!',
    'email.confirmed.greeting':
      'Hello {name}, Good news! The seller {vendor} has confirmed your order.',
    'email.confirmed.productLabel': 'Ordered product',
    'email.confirmed.ref': 'Ref.',
    'email.confirmed.body':
      'Your order is being prepared. You will receive a notification once it ships.',
    'email.confirmed.footer': 'Africa that buys and sells',

    'email.shipped.subject': 'Your package is on the way — {product}',
    'email.shipped.title': 'Your package is on the way!',
    'email.shipped.greeting':
      '{vendor} has just shipped your order. It is now on its way to you!',
    'email.shipped.productLabel': 'Shipped product',
    'email.shipped.addressLabel': 'Delivery address',
    'email.shipped.body':
      'If there is a problem with your delivery, contact the seller directly through the platform.',
    'email.shipped.footer': 'Africa that buys and sells',

    'email.cancelled.subject': 'Order cancelled — {product}',
    'email.cancelled.title': 'Order cancelled',
    'email.cancelled.greeting':
      'We are sorry. Your order from {vendor} has been cancelled.',
    'email.cancelled.productLabel': 'Cancelled order',
    'email.cancelled.ref': 'Ref.',
    'email.cancelled.body':
      'If you believe this is an error, contact our support or find another seller offering this product on WapiBei.',
    'email.cancelled.footer': 'Africa that buys and sells',

    'sms.orderClient':
      'WapiBei: Your order of {count} item(s) for {total} $ has been sent. The seller will contact you shortly.',
    'sms.orderVendor':
      'WapiBei: New order from {customer} ({total} $). Product(s): {products}. Tel: {phone}. Address: {address}.',
    'sms.newProduct': 'WapiBei: {vendor} published "{product}". See: {url}',
    'sms.orderConfirmed': 'WapiBei: Your order {orderId} has been confirmed by the seller.',
    'sms.orderShipped': 'WapiBei: Your order {orderId} is on its way.',
    'sms.orderDelivered': 'WapiBei: Your order {orderId} has been delivered. Enjoy!',

    // ── WhatsApp ───────────────────────────────────────────
    'whatsapp.order.header': '*New order on WapiBei*',
    'whatsapp.order.client': '*Customer :* {name}',
    'whatsapp.order.tel': '*Tel :* {phone}',
    'whatsapp.order.address': '*Address :* {address}',
    'whatsapp.order.product': '*Product :* {product}',
    'whatsapp.order.total': '*Total :* {total} $',
    'whatsapp.order.photo': '*Photo :* {url}',
    'whatsapp.order.link': '*View product :* {url}',
    'whatsapp.order.cta': '_Please contact the customer to confirm delivery._',
    'whatsapp.admin': 'ADMIN ALERT: New order from {customer} ({total} $).',

    'notif.status.confirmed.title': 'Order confirmed',
    'notif.status.confirmed.msg': '{vendor} has confirmed your order for "{product}".',
    'notif.status.shipped.title': 'Package on the way',
    'notif.status.shipped.msg': 'Your product "{product}" has been shipped by {vendor}.',
    'notif.status.delivered.title': 'Package delivered',
    'notif.status.delivered.msg': 'Your "{product}" has been delivered. Enjoy!',
    'notif.status.cancelled.title': 'Order cancelled',
    'notif.status.cancelled.msg': 'Your order for "{product}" has been cancelled.',

    'notif.newProduct.title': 'New product',
    'notif.newProduct.message': '{vendor} published: {product}',
    'notif.newProduct.body': '{vendor} published: {product}',
    'notif.vendorDefault': 'A seller',
    'notif.orderCreated.client': 'Order sent',
    'notif.orderCreated.clientMessage':
      'Your order of {count} item(s) for a total of {total} $ has been sent to the seller.',
    'notif.orderCreated.clientPush':
      'Your order has been sent to the seller for confirmation.',
    'notif.orderCreated.vendor': 'New sale',
    'notif.orderCreated.vendorMessage':
      'You received an order from {customer} for {count} item(s).',
    'notif.orderCreated.vendorPush':
      'A new order from {customer} awaits your approval.',
    'notif.abandonedCart.title': 'Cart waiting',
    'notif.abandonedCart.message':
      'You left {count} item(s) in your cart! Complete your order now.',
    'notif.penalty.title': 'Validation delay',
    'notif.penalty.message':
      'Your TrustScore has been reduced for inactivity on the order from {name}.',
    'notif.lowStock.title': 'Low Stock Alert',
    'notif.lowStock.message':
      'Only {count} unit(s) of "{product}" left.',
    'notif.lowStock.pushTitle': 'Almost out of stock',
    'notif.lowStock.pushBody': 'Only {count} "{product}" left in stock.',
    'notif.orderAdmin.title': 'New platform order',
    'notif.orderAdmin.message': '{customer} ordered {count} item(s) ({total} $).',
  },
  sw: {
    'email.otp.subject': 'Msimbo wako wa uthibitisho wa WapiBei',
    'email.otp.title': 'Thibitisha anwani yako ya barua pepe',
    'email.otp.body':
      'Asante kwa kujiunga nasi. Ili kumaliza usanidi wa akaunti yako, tafadhali ingiza msimbo ufuatao wa uthibitisho:',
    'email.otp.validity': 'Inatumika kwa dakika 10',
    'email.otp.ignore':
      'Ikiwa hukuunda akaunti kwenye WapiBei, unaweza kupuuza barua pepe hii kwa usalama.',
    'email.otp.footer': 'Jukwaa la ununuzi wa ndani.',
    'email.otp.help': 'Unahitaji msaada?',
    'email.otp.helpLink': 'Wasiliana na usaidizi',

    'email.reset.subject': 'Weka upya nenosiri lako la WapiBei',
    'email.reset.title': 'Weka upya nenosiri',
    'email.reset.greeting': 'Habari,',
    'email.reset.body':
      'Umeomba kuweka upya nenosiri lako. Bofya kitufe hapa chini kuunda nenosiri jipya:',
    'email.reset.cta': 'Weka upya nenosiri langu',
    'email.reset.warning':
      'Kiungo hiki kitakwisha baada ya saa 1. Ikiwa hukuomba kitendo hiki, hakuna hatua inayohitajika.',
    'email.reset.footer': 'Haki zote zimehifadhiwa.',

    'email.bulk.subject': '🛍️ Agizo lako la WapiBei limethibitishwa!',
    'email.bulk.header': 'Agizo Limethibitishwa',
    'email.bulk.greeting': 'Habari {name},',
    'email.bulk.body':
      'Habari njema! Agizo lako limepokelewa. Hapa kuna muhtasari wa manunuzi yako kwenye WapiBei:',
    'email.bulk.thImage': 'Picha',
    'email.bulk.thDetails': 'Maelezo',
    'email.bulk.thQty': 'Idadi',
    'email.bulk.thAmount': 'Kiasi',
    'email.bulk.total': 'JUMLA YA KIASI:',
    'email.bulk.noteTitle': 'Ujumbe muhimu:',
    'email.bulk.note':
      'Wauzaji wametaharifiwa na watawasiliana nawe moja kwa moja kupanga maelezo ya usafirishaji.',
    'email.bulk.thanks': 'Asante kwa kuchagua WapiBei kwa ununuzi wako wa ndani!',

    'email.vendor.subject': 'Uuzaji mpya kwenye WapiBei: {product}',
    'email.vendor.header': '🎉 AGIZO JIPYA!',
    'email.vendor.greeting': 'Hongera {name},',
    'email.vendor.body': 'Uuzaji mpya umefanyika hivi karibuni kwenye duka lako:',
    'email.vendor.ref': 'Ref:',
    'email.vendor.customerTitle': 'Maelezo ya mteja',
    'email.vendor.nameLabel': 'Jina:',
    'email.vendor.phoneLabel': 'Simu:',
    'email.vendor.cta': 'Wasiliana na mteja kupanga usafirishaji.',

    'email.admin.subject': 'ADMIN: Uuzaji mpya wa jukwaa - {customer}',
    'email.admin.title': 'Dashibodi ya Admin',
    'email.admin.body': 'Agizo jipya limewekwa kwenye WapiBei.',
    'email.admin.client': 'Mteja:',
    'email.admin.items': 'Vitu:',
    'email.admin.total': 'Jumla:',
    'email.admin.productsTitle': 'Bidhaa zilizoagizwa:',
    'email.admin.footer': 'WapiBei Auto-notification Engine',

    'email.welcome.subject': 'Karibu WapiBei, {name}! 🟠',
    'email.welcome.subtitle': 'Soko mahiri la Afrika',
    'email.welcome.greeting': 'Habari {name},',
    'email.welcome.title': 'Tunafurahi kukuona nasi!',
    'email.welcome.body':
      'Akaunti yako sasa imeamilishwa. Sasa uko kwenye mfumo wa WapiBei, ambapo unaweza kulinganisha bei, kufuata wauzaji unaowapenda na kupata ofa bora kwa kubofya moja.',
    'email.welcome.whatYouCanDo': 'Unachoweza kufanya:',
    'email.welcome.f1': 'Linganisha bei kote Afrika kwa wakati halisi.',
    'email.welcome.f2': 'Fuatilia maduka unayopenda.',
    'email.welcome.f3': 'Nunua kwa ujasiri kwa kutumia alama za uaminifu.',
    'email.welcome.cta': 'GUNDUA BIDHAA',
    'email.welcome.footer': '© 2026 WapiBei Tech. Haki zote zimehifadhiwa.',

    'email.pricedrop.subject': 'Bei imeshuka kwa {product}!',
    'email.pricedrop.badge': 'Arifa ya Bei',
    'email.pricedrop.title': 'Wakati wa kununua umefika!',
    'email.pricedrop.cta': 'ANGALIA OFA',

    'email.cart.subject':
      '{name}, umesahau vitu kwenye kikapu chako!',
    'email.cart.title': 'Oops!',
    'email.cart.body': 'Inaonekana uliacha {count} vitu kwenye kikapu chako.',
    'email.cart.cta': 'MALIZA AGIZO LANGU',

    'email.closure.subject': 'Muamala Umefungwa: {orderId}',
    'email.closure.title': 'RIPOTI YA KUFUNGA',
    'email.closure.body': 'Muamala ufuatao uliwekwa alama kama umekamilika kwenye WapiBei.',
    'email.closure.orderId': 'Nambari ya Agizo:',
    'email.closure.client': 'Mteja:',
    'email.closure.vendor': 'Muuzaji:',
    'email.closure.product': 'Bidhaa:',
    'email.closure.amount': 'Kiasi halisi:',
    'email.closure.footer': 'WapiBei Monitoring Sys',

    'email.newproduct.subject': '🌟 Kipya kutoka {vendor}: {product}',
    'email.newproduct.title': 'Kipya!',
    'email.newproduct.greeting': 'Habari {name},',
    'email.newproduct.body':
      'Duka unalolifuata, {vendor}, limetangaza bidhaa mpya:',
    'email.newproduct.cta': 'ANGALIA BIDHAA',
    'email.newproduct.footer':
      'Unapokea barua pepe hii kwa sababu unalifuata duka hili kwenye WapiBei.',

    'email.confirmed.subject': 'Agizo limethibitishwa — {product}',
    'email.confirmed.title': 'Agizo limethibitishwa!',
    'email.confirmed.greeting':
      'Habari {name}, Habari njema! Muuzaji {vendor} amethibitisha agizo lako.',
    'email.confirmed.productLabel': 'Bidhaa iliyoagizwa',
    'email.confirmed.ref': 'Ref.',
    'email.confirmed.body':
      'Agizo lako linatayarishwa. Utapokea arifa mara tu litakaposafirishwa.',
    'email.confirmed.footer': 'Afrika inayonunua na kuuza',

    'email.shipped.subject': 'Kifurushi chako kiko njiani — {product}',
    'email.shipped.title': 'Kifurushi chako kiko njiani!',
    'email.shipped.greeting':
      '{vendor} amesafirisha agizo lako. Sasa linakuja kwako!',
    'email.shipped.productLabel': 'Bidhaa iliyosafirishwa',
    'email.shipped.addressLabel': 'Anwani ya usafirishaji',
    'email.shipped.body':
      'Ikiwa kuna tatizo na usafirishaji wako, wasiliana na muuzaji moja kwa moja kupitia jukwaa.',
    'email.shipped.footer': 'Afrika inayonunua na kuuza',

    'email.cancelled.subject': 'Agizo limeghairiwa — {product}',
    'email.cancelled.title': 'Agizo limeghairiwa',
    'email.cancelled.greeting':
      'Samahani. Agizo lako kutoka {vendor} limeghairiwa.',
    'email.cancelled.productLabel': 'Agizo lililoghairiwa',
    'email.cancelled.ref': 'Ref.',
    'email.cancelled.body':
      'Ikiwa unaamini hili ni kosa, wasiliana na usaidizi wetu au tafuta muuzaji mwingine anayeuza bidhaa hii kwenye WapiBei.',
    'email.cancelled.footer': 'Afrika inayonunua na kuuza',

    'sms.orderClient':
      'WapiBei: Agizo lako la {count} vitu kwa {total} $ limetumwa. Muuzaji atawasiliana nawe hivi karibuni.',
    'sms.orderVendor':
      'WapiBei: Agizo jipya kutoka {customer} ({total} $). Bidhaa: {products}. Simu: {phone}. Anwani: {address}.',
    'sms.newProduct': 'WapiBei: {vendor} amechapisha "{product}". Angalia: {url}',
    'sms.orderConfirmed': 'WapiBei: Agizo lako {orderId} limethibitishwa na muuzaji.',
    'sms.orderShipped': 'WapiBei: Agizo lako {orderId} liko njiani.',
    'sms.orderDelivered': 'WapiBei: Agizo lako {orderId} limewasilishwa. Furahia!',

    // ── WhatsApp ───────────────────────────────────────────
    'whatsapp.order.header': '*Agizo jipya kwenye WapiBei*',
    'whatsapp.order.client': '*Mteja :* {name}',
    'whatsapp.order.tel': '*Simu :* {phone}',
    'whatsapp.order.address': '*Anwani :* {address}',
    'whatsapp.order.product': '*Bidhaa :* {product}',
    'whatsapp.order.total': '*Jumla :* {total} $',
    'whatsapp.order.photo': '*Picha :* {url}',
    'whatsapp.order.link': '*Tazama bidhaa :* {url}',
    'whatsapp.order.cta': '_Tafadhali wasiliana na mteja kuthibitisha usafirishaji._',
    'whatsapp.admin': 'TAHADHARI ADMIN: Agizo jipya kutoka {customer} ({total} $).',

    'notif.status.confirmed.title': 'Agizo limethibitishwa',
    'notif.status.confirmed.msg': '{vendor} amethibitisha agizo lako la "{product}".',
    'notif.status.shipped.title': 'Kifurushi kiko njiani',
    'notif.status.shipped.msg': 'Bidhaa yako "{product}" imesafirishwa na {vendor}.',
    'notif.status.delivered.title': 'Kifurushi kimewasilishwa',
    'notif.status.delivered.msg': 'Bidhaa yako "{product}" imewasilishwa. Furahia!',
    'notif.status.cancelled.title': 'Agizo limeghairiwa',
    'notif.status.cancelled.msg': 'Agizo lako la "{product}" limeghairiwa.',

    'notif.newProduct.title': 'Bidhaa mpya',
    'notif.newProduct.message': '{vendor} amechapisha: {product}',
    'notif.newProduct.body': '{vendor} amechapisha: {product}',
    'notif.vendorDefault': 'Muuza mazao',
    'notif.orderCreated.client': 'Agizo limetumwa',
    'notif.orderCreated.clientMessage':
      'Agizo lako la {count} vitu kwa jumla ya {total} $ limetumwa kwa muuzaji.',
    'notif.orderCreated.clientPush':
      'Agizo lako limetumwa kwa muuzaji kwa uthibitisho.',
    'notif.orderCreated.vendor': 'Uuzaji mpya',
    'notif.orderCreated.vendorMessage':
      'Umepokea agizo kutoka {customer} la {count} vitu.',
    'notif.orderCreated.vendorPush':
      'Agizo jipya kutoka {customer} linangoja idhini yako.',
    'notif.abandonedCart.title': 'Kikapu kinasubiri',
    'notif.abandonedCart.message':
      'Umeacha {count} kitu(kitu) kwenye kikapu chako! Kamilisha agizo lako sasa.',
    'notif.penalty.title': 'Ucheleweshaji wa uthibitisho',
    'notif.penalty.message':
      'TrustScore yako imepunguzwa kwa kutokuwa na shughuli kwenye agizo la {name}.',
    'notif.lowStock.title': 'Onyo la Hisa Chache',
    'notif.lowStock.message':
      'Zimebaki vitengo {count} vya "{product}".',
    'notif.lowStock.pushTitle': 'Hisa inakaribia kuisha',
    'notif.lowStock.pushBody': 'Zimebaki {count} "{product}" hisani.',
    'notif.orderAdmin.title': 'Agizo jipya la jukwaa',
    'notif.orderAdmin.message': '{customer} ameagiza {count} kitu(kitu) ({total} $).',
  },
};
