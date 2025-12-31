import "./faith.css";
import Post from "../../components/post/Post";
import DataTile from "../../components/dataTile/DataTile";

const Faith = () => {
  // Configure your database table and schema here
  const POST_TABLE = "post";
  const POST_SCHEMA = "faith_and_worship"; // Change this to your desired schema

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
        <h1>Faith & Worship</h1>
        <p>
          When you're new to faith, it can be hard to know where to start. Use
          this space to share your journey with others and learn from others.
          You can share your thoughts, experiences, and questions with others.
          You can also ask others for advice or help. You can also share your
          prayers, scriptures, and other resources with others. Always cross
          reference the Bible with other resources to confirm your
          understanding. We are all learning.
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

export default Faith;
