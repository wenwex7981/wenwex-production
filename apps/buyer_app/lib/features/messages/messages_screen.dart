import 'package:flutter/material.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () {}),
        ],
      ),
      body: ListView.builder(
        itemCount: 15,
        itemBuilder: (context, index) {
          return ListTile(
            leading: Stack(
              children: [
                const CircleAvatar(
                  radius: 24,
                  child: Text('V'),
                ),
                if (index % 3 == 0)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        border: Border.all(color: Colors.white, width: 2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
              ],
            ),
            title: Text('Vendor Name $index', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(
              index % 2 == 0 ? 'Yes, the item is available.' : 'Thank you for your order!',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontWeight: index % 3 == 0 ? FontWeight.bold : FontWeight.normal),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('10:30 AM', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                if (index % 3 == 0)
                  Container(
                    margin: const EdgeInsets.top(4),
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text('2', style: TextStyle(color: Colors.white, fontSize: 10)),
                  ),
              ],
            ),
            onTap: () {
              // Open Chat Detail
            },
          );
        },
      ),
    );
  }
}
