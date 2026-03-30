export class SendMessageDto {
  roomId!: string;
  senderId!: string;
  receiverId!: string; // 👈 ADD THIS
  message!: string;
}