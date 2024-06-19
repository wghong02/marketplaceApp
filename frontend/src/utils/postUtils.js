import handleResponseStatus from "@/utils/errorUtils";
import { camelizeKeys, decamelizeKeys } from "humps";

const domain = "http://localhost:8080"; // local test
// const domain = "http://18.216.40.20:8080"; // aws container

export const getPost = (postId) => {
  // get a single post by post Id. response is json
  const url = `${domain}/posts/${postId}`;

  return fetch(url)
    .then((response) => {
      handleResponseStatus(response, "Fail to get post");
      return response.json();
    })
    .then((data) => camelizeKeys(data));
};

export const searchPostsByDescription = (query) => {
  // use query parameters to search for posts. result is a batch of posts
  const description = query?.description ?? "";
  const batch = query?.batch ?? "";
  const totalSize = query?.totalSize ?? "";

  const url = new URL(`${domain}/search`);
  url.searchParams.append("description", description);
  url.searchParams.append("batch", batch);
  url.searchParams.append("totalSize", totalSize);

  return fetch(url)
    .then((response) => {
      handleResponseStatus(response, "Fail to search for posts");
      return response.json();
    })
    .then((data) => camelizeKeys(data));
};

export const uploadPost = (data) => {
  // user post post with auth token
  const authToken = localStorage.getItem("authToken");
  const url = `${domain}/user/posts/upload`;

  const {
    title,
    description,
    price,
    condition,
    postLocation,
    postDetails,
    imageUrl,
  } = data;

  const body = JSON.stringify({
    title,
    description,
    price: Number(price),
    condition,
    post_location: postLocation,
    post_details: postDetails,
    image_url: imageUrl,
  });

  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: body,
  }).then((response) => {
    handleResponseStatus(response, "Fail to upload post");
  });
};

export const deletePost = (postId) => {
  // delete post using its id
  const authToken = localStorage.getItem("authToken");
  const url = `${domain}/user/posts/delete/${postId}`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
    .then((response) => {
      handleResponseStatus(response, "Fail to delete post");
    })
    .then((data) => camelizeKeys(data));
};

export const getMostViewedPosts = (query) => {
  // get a most viewed posts for recommendation. response is json

  const url = new URL(`${domain}/posts/get/mostViewed`);
  if (query?.batch) {
    url.searchParams.append("batch", query.batch);
  }

  if (query?.totalSize) {
    url.searchParams.append("totalSize", query.totalSize);
  }
  console.log(url.toString())

  return fetch(url.toString())
    .then((response) => {
      handleResponseStatus(response, "Fail to get post");
      return response.json();
    })
    .then((data) => camelizeKeys(data));
};

export const getUserPosts = ({ userId, query }) => {
  // get the upload history of a user with its id
  const url = new URL(`${domain}/postHistory/${userId}`);
  if (query?.batch) {
    url.searchParams.append("batch", query.batch);
  }

  if (query?.totalSize) {
    url.searchParams.append("totalSize", query.totalSize);
  }

  return fetch(url.toString())
    .then((response) => {
      handleResponseStatus(response, "Fail to search for upload history");
      return response.json();
    })
    .then((data) => camelizeKeys(data));
};
