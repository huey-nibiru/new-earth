import "./education.css";
import Post from "../../components/post/Post";
import DataTile from "../../components/dataTile/DataTile";

const Education = () => {
  // Configure your database table and schema here
  const POST_TABLE = "post";
  const POST_SCHEMA = "education_and_knowledge"; // Change this to your desired schema

  const dataTiles = [
    {
      schema: POST_SCHEMA,
      tableName: POST_TABLE,
    },
  ];

  const handlePostSuccess = (newPost) => {
    console.log("New post created:", newPost);
  };

  return (
    <div>
      <div className="header">
        <h1>Education & Knowledge</h1>
        <p>
          Educational content (math, science, history, random facts, etc). All
          knowledge leads back to God. Use this space to share your knowledge
          with others and learn from others. You can share your thoughts,
          experiences, and questions with others. You can also ask others for
          advice or help. You can also share your resources and other
          educational materials with others.
        </p>
      </div>
      <div className="post-container">
        <Post
          tableName={POST_TABLE}
          schema={POST_SCHEMA}
          onPostSuccess={handlePostSuccess}
        />
      </div>
      <div className="data-tiles-container">
        {dataTiles.map((tile, index) => (
          <DataTile
            key={`${tile.schema}-${tile.tableName}-${index}`}
            schema={tile.schema}
            tableName={tile.tableName}
          />
        ))}
      </div>
      <div className="footer">
        <p style={{ color: "white" }}></p>
      </div>
    </div>
  );
};

export default Education;
