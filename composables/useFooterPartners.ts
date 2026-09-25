export interface PartnerItem {
  id?: string
  name: string
  code?: string
  image: string
  category?: 'bank' | 'ewallet' | 'retail' | 'courier'
}

export function useFooterPartners() {
  // Official Payment Partners from production MongoDB bkk_payment_methods & bkk_banks
  const paymentMethods: PartnerItem[] = [
    {
      name: 'BCA',
      code: 'bca',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fa_20231127090822_20.BCA.png',
      category: 'bank',
    },
    {
      name: 'Mandiri',
      code: 'mandiri',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec500_20231127091007_19.Mandiri.png',
      category: 'bank',
    },
    {
      name: 'BNI',
      code: 'bni',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fe_20231127090933_17.%20BNI%20JPG.jpeg',
      category: 'bank',
    },
    {
      name: 'BRI',
      code: 'bri',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4ff_20231127090951_18.BRI.webp',
      category: 'bank',
    },
    {
      name: 'BSI',
      code: 'bsi',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec503_20231127091044_4.bsi.png',
      category: 'bank',
    },
    {
      name: 'Permata Bank',
      code: 'permata',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec504_20231127091057_5.permata.png',
      category: 'bank',
    },
    {
      name: 'CIMB Niaga',
      code: 'cimb',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec502_20231127091031_3.cimb.jpeg',
      category: 'bank',
    },
    {
      name: 'QRIS',
      code: 'qris',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_63d61aaabebd6aec3200e4f1_20231127091218_11.ShopeePay_QRI.webp',
      category: 'ewallet',
    },
    {
      name: 'GOPAY',
      code: 'gopay',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_6183746afc0b2c6e11dec4ef_20231124184936_gopay-integration.png',
      category: 'ewallet',
    },
    {
      name: 'ShopeePay',
      code: 'shopeepay',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_62860ca61c958c7c79e5c6f1_20231127091206_10.shopeePay.jpeg',
      category: 'ewallet',
    },
    {
      name: 'DANA',
      code: 'dana',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_62860ca61c958c7c79e5c6f0_20231127091151_9.dana.png',
      category: 'ewallet',
    },
    {
      name: 'OVO',
      code: 'ovo',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837427fc0b2c6e11dec4ea_20231124114228_logo-ovo.png',
      category: 'ewallet',
    },
    {
      name: 'Indomaret',
      code: 'indomaret',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_61837757fc0b2c6e11dec505_20231127091109_6.indomaret.png',
      category: 'retail',
    },
    {
      name: 'Alfamart',
      code: 'alfamart',
      image: 'https://bc.bekasku.id/myadmin/assets/images/payment-method/payment_method_6183779dfc0b2c6e11dec50a_20231127091127_7%20alfamart.png',
      category: 'retail',
    },
  ]

  // Official Courier Partners from production MongoDB bkk_courriers
  const couriers: PartnerItem[] = [
    {
      name: 'J&T Express',
      code: 'jnt',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344066760601.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=VJ22nO3e1TkSKqxKLIaHuCdPAeOTxXB9XX4ABUGasIIQE%2FIjURr9NMw564t5%2Fo4h3tnKbKwLY%2Fs86SUookFaEWEBUkeYW4QtHerQOlMEF8weq6LkIexTEk7cjeUkyrQ79g7wv%2FMt%2FuF%2Fhf%2B1Eq8F2gbYR9%2BfJ4OEgc70B4FCJXTTsL74WjME3y%2BW4qNhCn32boahkRpJ7uT%2BR0uY6n2GfO4%2B6cTNvXFPa7FKD1c99kxP27SoN3dKAr7oGi%2FHpIVOjZrmMQBoZ3M5qn4KQuT2Kg85xKdRVjQlc3ekuLX6evrBg6OHIrFE8b138AX6oSsQ0ZWEGoJUhjKeKoCxfqR1pQ%3D%3D',
      category: 'courier',
    },
    {
      name: 'SiCepat',
      code: 'sicepat',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344091288719.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=Cfw6S%2FVfkkOe%2By%2F%2FQ7RvROHkLWBwgi%2FzWOKrHVEi0BcQ2C761847PPUzvbrXLPSjB%2FhxWmOjp3F0co7vOUP7Eoukus%2BUUWsj9nXPWy9hvQXNmQkN8mNr3GxfQglM7zr200Ti0sMgxWy21Yj1umiDkZJNBCOp7pK0bXUjmO8pdym2zpxVOijktnCSjIwPcZFbcENHmlBp8h8ORfVqgGA5XcAaIG8TdDIMtJslLIZjN49RALDi9RCbVkECzN%2FKtgBER0z4zRiBDDCjb%2FiF0HjnNPhjwZr7XPp%2FCPJHGfNXDSmUzHwDrXL9j5GbTw70S%2FPwNdyjXYcZYu57Z7iyWblWrQ%3D%3D',
      category: 'courier',
    },
    {
      name: 'Lion Parcel',
      code: 'lion',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-17869834414386746.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=iWpeI34al63Q90LExvMAVV9j5cUdrnxis4bHBhB1kr9ybNYsDsuxAhn629FvyAPwR1deJOi2HGe0rb4qY%2FYahZnzz1FDKyuxxBthO1QcP4Sx5HySpV%2B40sWq5U3wFSeTmq3IKMGIl5tQSVQvDxK4w925FmWjGSNFJ0Am2q7kO8c6%2BBSxMWcG3mMHBtOI6Wfwh3S%2FDSOnyH6Gbx5%2FaOB2b%2BcVhRo%2FJjuiWTeMTu%2BVB3XmdZwiqj3lG0nOx4SmGbYdMG3eUbdgalaOQIjyI0fZMwn3JpYb0HzQa3rjj1BB3fIj0eIVkoqAPmrgcxE89uwa4XQU5Lkex%2BHt709mwS%2FOVw%3D%3D',
      category: 'courier',
    },
    {
      name: 'Paxel',
      code: 'paxel',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344168575696.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=KqCQSZM9j5NtT6%2FiUccJEXjN%2FePchuaHa2JVeVxoHDDwtFVmr8odQmb55Z8x39Ms4aN56DysBqd%2FDGCZLRXraw8hoZvvbWtho89ddBzb4pxF8itHks29AZghqC3SCmQjAQdN6Wh%2Fl41klPhspDWkMcJb%2B5wTsHjrf0RviR9SeU90NOdVp4qjQpLj%2BE%2FxpuyPgY%2BZQOv2LW2YHY7II%2BHZz6ox5rGr5NJsFQ3vVRqAJL5fDgROwgi0BbctYBLJI6JlPb5JvsKqX2WVi0jbOJSHB5goC16jYTZv8pcCIpNJhx8G0hjPNDEKPQvL9OWMschVlK%2BOVwRKp5bsoaUCveGKpQ%3D%3D',
      category: 'courier',
    },
    {
      name: 'Deliveree',
      code: 'deliveree',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344192972989.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=AtqE5ZHYHa8o3JTZvUV3%2BSb8uKBZrhQHZtr86sd49PjCY960waWZgexBP6jL8E4DGHv4dXntdpEhblq%2FjrlBUQJ5Za9klJLtMJ4AYoSHaqAh20kcTymtSx4VE5T992YeG%2BgAN3lX7tzzjuSLCcaChjYg4bAxh3CpmP8A3IR47PKleEXsbBUo02aaLtJQSzTbVX7qwV0VF4jvomomCm05hDm7EOR%2FOiAhT7eAuh%2BTDD68xevK%2F7xjAyAlyLBgiVRsKWGjc8fQSMlZYwqKuEg48qkgIZaKExiPWxmn%2Bxd7VsoDtyiBaCuvAbUk8jE2pvE53RjTnr7sIFDRh5sn%2BewDEw%3D%3D',
      category: 'courier',
    },
    {
      name: 'Lalamove',
      code: 'lalamove',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344066760601.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=VJ22nO3e1TkSKqxKLIaHuCdPAeOTxXB9XX4ABUGasIIQE%2FIjURr9NMw564t5%2Fo4h3tnKbKwLY%2Fs86SUookFaEWEBUkeYW4QtHerQOlMEF8weq6LkIexTEk7cjeUkyrQ79g7wv%2FMt%2FuF%2Fhf%2B1Eq8F2gbYR9%2BfJ4OEgc70B4FCJXTTsL74WjME3y%2BW4qNhCn32boahkRpJ7uT%2BR0uY6n2GfO4%2B6cTNvXFPa7FKD1c99kxP27SoN3dKAr7oGi%2FHpIVOjZrmMQBoZ3M5qn4KQuT2Kg85xKdRVjQlc3ekuLX6evrBg6OHIrFE8b138AX6oSsQ0ZWEGoJUhjKeKoCxfqR1pQ%3D%3D',
      category: 'courier',
    },
    {
      name: 'Indah Logistik',
      code: 'indah',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344217081482.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=V%2BgVflv8%2Bn0RJzgfTHFKmPrntbhRqOerBlWaDO1FunPmPvUuXFiCAbfcUpbxRYNiTSEaWnTcxn4QdCZmpL4XEcONjvOR0nxYNZ7SDZpknwqXU%2F3287mcP%2FuA9djpVDJwHHaBQpL7PCWmveU8lZ7g1kNdRkkQ%2B0igB%2BfxmjIULHXoM8Uz9Q7dfjhIMiGQT34u87l7OxS%2BlQeX5C8kOICW1kP6l0i7nI76EsxD0TGPpZCPPd5q1CUXN6LGQMA1Xr4FKIlyJaC%2FFSTxTK%2FtC%2FJXHCNqO9YEmgLCZFkMF2KN3W2JK9Yov%2F%2F1Aiu%2BT%2F1XeqUfZPkhv1oJRBdyHDFFvvGl6g%3D%3D',
      category: 'courier',
    },
    {
      name: 'IDexpress',
      code: 'ide',
      image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/delivery/image-178698344264210272.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=IKhvam3YOsUabrb4zLa%2FCF1E5GgkR5ZjssvTSwUgIuc%2Bz8K5myX5m4Ry3Df1qaNCOeib0%2BYSGT%2FzBsMbCAND7YeuZDfKYsQXkQQt%2BDLJ7VD9DmsgeZAZGwUAJlEBh9pK7mXWKNUQKWIhO5EvOkeEl7NkSe%2B%2BNLJRVk31fHpUBO35RNAan25hXLf9Ojo0%2BanbYBOKfUr5k6dh%2BdovX7WaGVZIQeYZjxQHHMyywmsSkOAmfx%2FBAGZBSAtdSGoUqU4WOhE6mS6FXIMWtevKT%2FiFQss1MUcVT1xRDIpSEwW%2BheCuKxl8TDY9clHaSxvMNC3YOFygdcqwsAiiFsVBaXwm9g%3D%3D',
      category: 'courier',
    },
  ]

  return {
    paymentMethods,
    couriers,
  }
}
