import "./about.css";
import goldCross from "../../assets/goldcross.png";

const About = () => {
  return (
    <div className="about">
      <div className="about-details">
        <img
          src={goldCross}
          alt="Gold Cross"
          style={{ width: "50px", height: "auto", margin: "10px 0" }}
        />
        <p>
          There will always be an emphasis on putting{" "}
          <strong style={{ color: "red" }}>THE BIBLE FIRST</strong>, but a huge
          problem for me and many others who walked away from faith was not
          having a proper church or group of people that truly broke down what
          it meant to be Christian in a modern world. Much of what I disliked
          about Christianity was actually{" "}
          <strong style={{ color: "red" }}>CARNAL CHRISTIANITY</strong>.
          Eventually if you want truth you'll find it; there are plenty of
          resources online that can help you understand exactly how to grow in
          faith and/or operate in the world as someone with faith.
        </p>
        <p>
          Everything will always be downstream from the Bible, but the world is
          often incompatible with the true nature of Christ's teachings. Theres
          only a small amount of Christians who truly follow the Bible, and even
          fewer who have an applied perspective on how a Christ centered society
          could operate. After realizing how much I still do not understand, I
          wanted a hub where both experienced Christians and new Christians
          could organize and explore different aspects of modern life through a
          True Christian lens. The main focus is having other people with a
          Christian perspective give insight into both spiritual and material
          concerns. Whether you're Orthodox, Catholic, Protestant, or even a
          NonChristian who is for the first time interested in learning the True
          path of our Lord Jesus Christ, you're welcome here.
        </p>

        <p>
          <strong>Common Areas of Focus</strong>
        </p>
        <ol>
          <li>
            <strong>Faith & Worship</strong> - Share life experience, faith, and
            prayer.{" "}
          </li>
          <li>
            <strong>Education & Knowledge</strong> - Educational content (math,
            science, history, random facts, etc). All knowledge leads back to
            God.{" "}
          </li>
          <li>
            <strong>Family & Community Life</strong> - Family-focused
            resources{" "}
          </li>
          <li>
            <strong>Governance & Justice</strong> - Governance and legal
            information{" "}
          </li>
          <li>
            <strong>Economy & Work</strong> - Economic and employment
            resources{" "}
          </li>
          <li>
            <strong>Health & Well-being</strong> - Share diet, gym routines,
            mental health practices{" "}
          </li>
          <li>
            <strong>Agriculture & Food Security</strong> - Agricultural
            information{" "}
          </li>
          <li>
            <strong>Technology & Innovation</strong> - Tech news, engineering,
            collaboration{" "}
          </li>
          <li>
            <strong>Art & Music</strong> - Creative content and artistic
            works{" "}
          </li>
          <li>
            <strong>Service & Charity</strong> - Post available services and
            charitable work{" "}
          </li>
          <li>
            <strong>Environment & Creation Care</strong> - Proper care of your
            surroundings surroundings{" "}
          </li>
          <li>
            <strong>Defense & Safety</strong> - Self Desfense and training
          </li>
        </ol>
      </div>
    </div>
  );
};

export default About;
