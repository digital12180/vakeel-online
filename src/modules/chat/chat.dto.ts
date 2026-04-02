export class SendMessageDto {
  senderId!: string;
  receiverId!: string; // 👈 ADD THIS
  message!: string;
}