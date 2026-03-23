
window.cookieconsent_options = {"message":"By continuing to use our site, you accecpt our ","dismiss":"Close","learnMore":"use of cookies, Privacy Policy and Terms of Use","link":"https://" + window.location.hostname + "/legal.php","theme":"dark-bottom"};
var xmlhttp;
xmlhttp=new XMLHttpRequest();

function createCookie(name,value,days) {
   if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
   }
   else var expires = "";
   document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
   var nameEQ = name + "=";
   var ca = document.cookie.split(';');
   for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
   }
   return null;
}

function isEU (a){

   var rValue = a == "AT" ||
                a == "BE" ||
                a == "BG" ||
                a == "CY" ||
                a == "HR" ||
                a == "CZ" ||
                a == "DK" ||
                a == "EE" ||
                a == "FI" ||
                a == "FR" ||
                a == "DE" ||
                a == "GR" ||
                a == "HU" ||
                a == "IE" ||
                a == "IT" ||
                a == "LV" ||
                a == "LT" ||
                a == "LU" ||
                a == "MT" ||
                a == "NL" ||
                a == "PL" ||
                a == "PT" ||
                a == "RO" ||
                a == "SK" ||
                a == "SI" ||
                a == "ES" ||
                a == "SE" ||
                //a == "US" ||
                a == "GB";

   return rValue;
}

function showBanner (){
   var s = document.createElement('script');
   s.type = 'text/javascript';
   s.async = true;
   s.src = '//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.10/cookieconsent.min.js';
   var headTag = document.getElementsByTagName('head')[0];
   headTag.appendChild(s);
}

//xmlhttp.onreadystatechange=function()
//{
//   if (xmlhttp.readyState==4 && xmlhttp.status==200)
//   {
//      var sCountryCode = JSON.parse(xmlhttp.responseText).country_code;
//
//      if (isEU(sCountryCode))
//      {
//         createCookie("partOfEU","t",30);
//
//         showBanner ();
//      }
//      else
//      {
//         createCookie("partOfEU","f",30);
//      }
//   }
//}


var onMaxSuccess = function(location){
      var sCountryCode = location.country.iso_code;

      if (isEU(sCountryCode))
      {
         createCookie("partOfEU","t",300);

         showBanner ();
      }
      else
      {
         createCookie("partOfEU","f",300);
      }
};
 
var onMaxError = function(error){
};



function maxLoaded(){
   geoip2.country(onMaxSuccess, onMaxError);
}

if (document.cookie.indexOf("partOfEU") > -1) {
   if(readCookie("partOfEU") == "t") {
      if (!(document.cookie.indexOf("cookieconsent_dismissed") > -1)) {
         showBanner ();
      }
   }
}
else
{
   
   //xmlhttp.open("GET","https://freegeoip.net/json/",true);
   //xmlhttp.send();
   
   var s0 = document.createElement('script');
   s0.type = 'text/javascript';
   s0.async = true;
   s0.src = '//js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js';
   var headTag = document.getElementsByTagName('head')[0];
   headTag.appendChild(s0);
   s0.onload = maxLoaded;
}


