import "./agriculture.css";
import Post from "../../components/post/Post";
import DataTile from "../../components/dataTile/DataTile";

const Agriculture = () => {
  // Configure your database table and schema here
  const POST_TABLE = "post";
  const POST_SCHEMA = "agriculture_and_food_security"; // Change this to your desired schema

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
        <h1>Agriculture & Food Security</h1>
        <p>
          Agricultural information. Use this space to share your agricultural experiences with others and learn from others.
          You can share your thoughts, experiences, and questions with others.
          You can also ask others for advice or help. You can also share your
          resources and other agricultural materials with others.
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

export default Agriculture;
