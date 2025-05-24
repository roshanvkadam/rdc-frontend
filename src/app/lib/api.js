"use client";
const URL = process.env.NEXT_PUBLIC_URL
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export async function getComputers() {
  const res = await fetch(`${URL}/computers`,
    {
      headers: {
        "x-api-secret": API_SECRET,
      },
    }
  );
  return res.json();
}

export const shutdownComputer = async (computerName) => {
  const response = await fetch(`${URL}/shutdown/${computerName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": API_SECRET,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

export const shutdownAll = async () => {
  const response = await fetch(`${URL}/shutdown-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": API_SECRET,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

export const removeComputer = async (computerName) => {
  const response = await fetch(`${URL}/remove/${computerName}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": API_SECRET,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};