import React from "react";
import playStore from "../../../images/playstore.png";
import appStore from "../../../images/Appstore.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="leftFooter">
        <h4>DOWNLOAD OUR APP</h4>
        <p>Download App for Android and IOS mobile phone</p>
        <img src={playStore} alt="playstore" />
        <img src={appStore} alt="Appstore" />
      </div>

      <div className="midFooter">
        <h1>FairShare</h1>
        <p>Sharing expenses made fair and stress-free.</p>

        <p>Copyrights 2021 &copy; PrathamBapna</p>
      </div>

      <div className="rightFooter">
        <h4>Follow Us</h4>
        <a href="http://instagram.com/prathambapna_">Instagram</a>
        <a href="http://facebook.com/prathambapna">Facebook</a>
      </div>
    </footer>
  );
};

export default Footer;