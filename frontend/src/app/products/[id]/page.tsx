"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  Image,
  StackDivider,
  HStack,
} from "@chakra-ui/react";
import Header from "@/ui/components/web/Header";
import { getProduct } from "@/utils/productUtils";
import { getUserInfo } from "@/utils/userUtils";
import { Product, User } from "@/lib/model";
import RatingDisplay from "@/ui/components/users/ratingComponent";
import UserCard from "@/ui/components/users/userInfoComponent";
import ProductPageCard from "@/ui/components/products/productInfoComponent";

const ProductPage = ({ params }: { params: { id: string } }) => {
  // product page for the users to upload and delete and view products they own
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await getProduct(params.id);
        setProduct(response);
        console.log(response);
        if (response) {
          fetchUser(response.sellerId);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    const fetchUser = async (sellerId: number) => {
      try {
        const response = await getUserInfo(sellerId);
        setUser(response);
      } catch (error) {
        console.error("Failed to fetch the corresponding user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (!product) {
    return <div>No product found</div>; // Handle no product found, TO BE SEPARATED
  }
  return (
    <>
      <Header />
      <Box display="flex" justifyContent="center" mt="4">
        <VStack
          width="60%"
          divider={<StackDivider borderColor="gray.200" />}
          spacing="5"
          align="stretch"
        >
          {/* Hstacks to organize the details of the product */}
          <HStack spacing={4}>
            <Flex width="70%" h="400px" align={"center"} justify={"center"}>
              <Image
                src={product.imageUrl}
                alt="Product Image"
                objectFit="cover"
                maxW="100%"
                maxH="100%"
              />
            </Flex>
            <Flex width="30%" h="400px">
              <VStack
                width="100%"
                spacing="5"
                align="stretch"
                divider={<StackDivider borderColor="gray.200" />}
              >
                <Flex h="300px">
                  <UserCard user={user}></UserCard>
                </Flex>
                <Flex h="100px">
                  <RatingDisplay
                    rating={user?.userRating}
                    reviews={user?.totalReviews}
                  ></RatingDisplay>
                </Flex>
              </VStack>
            </Flex>
          </HStack>

          <HStack spacing={4}>
            <Flex width="70%" h="200px">
              <ProductPageCard product={product}></ProductPageCard>
            </Flex>
            <Flex width="30%" h="200px" bg="tomato">
              4
            </Flex>
          </HStack>

          <Box h="200px" bg="pink.100">
            For future recommendations
          </Box>
        </VStack>
      </Box>
    </>
  );
};
export default ProductPage;