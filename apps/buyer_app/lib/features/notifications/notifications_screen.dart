import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(onPressed: () {}, child: const Text('Mark all read')),
        ],
      ),
      body: ListView.builder(
        itemCount: 10,
        itemBuilder: (context, index) {
          return Container(
            color: index < 3 ? Colors.blue.withOpacity(0.05) : null, // Highlight unread
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.grey[200],
                child: Icon(
                  index % 2 == 0 ? Icons.local_shipping : Icons.discount,
                  color: Colors.black87,
                ),
              ),
              title: Text(
                index % 2 == 0 ? 'Order #1234 has been shipped!' : 'New 20% off coupon code available',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: 4),
                  Text('Tap to view details.'),
                  SizedBox(height: 4),
                  Text('2 hours ago', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
              onTap: () {},
            ),
          );
        },
      ),
    );
  }
}
