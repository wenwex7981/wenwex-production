import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ServiceDetailsScreen extends StatelessWidget {
  final String serviceId;

  const ServiceDetailsScreen({super.key, required this.serviceId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Service Details'),
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
          IconButton(icon: const Icon(Icons.favorite_border), onPressed: () {}),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Book Now', style: TextStyle(fontSize: 18)),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Placeholder
            Container(
              height: 250,
              color: Colors.grey[300],
              child: const Center(child: Icon(Icons.image, size: 64, color: Colors.grey)),
            ),
            
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'Service Title Goes Here',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '\$50',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber, size: 20),
                      Text(' 4.8 (120 reviews)', style: TextStyle(fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const Divider(height: 32),
                  
                  // Vendor Info
                  InkWell(
                    onTap: () => context.push('/vendor/123'),
                    child: const Row(
                      children: [
                        CircleAvatar(child: Text('V')),
                        SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Vendor Name', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('Verified Seller', style: TextStyle(color: Colors.green, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 32),
                  
                  const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text(
                    'This is a detailed description of the service provided. It includes all the necessary information for the buyer to make a decision.',
                    style: TextStyle(height: 1.5, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
