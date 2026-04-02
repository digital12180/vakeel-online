import crypto from "crypto";
export const generateRoomId = (user1: string, user2: string): string => {
  const sortedUsers = [user1, user2].sort().join("_");

  return crypto
    .createHash("sha256")
    .update(sortedUsers)
    .digest("hex");
};