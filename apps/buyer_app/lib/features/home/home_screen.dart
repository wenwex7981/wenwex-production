import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../notifications/notifications_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WenWex'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined),
            onPressed: () => context.push('/cart'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner Placeholder
            Container(
              height: 200,
              width: double.infinity,
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(child: Text('Promotional Banner')),
            ),
            
            // Categories
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(onPressed: () {}, child: const Text('View All')),
                ],
              ),
            ),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: 5,
                itemBuilder: (context, index) {
                  return Container(
                    width: 70,
                    margin: const EdgeInsets.only(right: 12),
                    child: Column(
                      children: [
                        const CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.blueAccent,
                          child: Icon(Icons.category, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text('Cat $index', maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 24),

            // Featured Services
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('Featured Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: 3,
              itemBuilder: (context, index) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    onTap: () => context.push('/service-details/$index'),
                    leading: Container(
                      width: 60,
                      height: 60,
                      color: Colors.grey[200],
                      child: const Icon(Icons.image),
                    ),
                    title: Text('Service Title $index'),
                    subtitle: const Text('Vendor Name • ⭐ 4.5'),
                    trailing: const Text('\$50'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
