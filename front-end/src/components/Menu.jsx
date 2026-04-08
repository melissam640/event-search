import { useNavigate, useLocation } from 'react-router-dom';
import { Flex, Container, Heading, Button, Box, DropdownMenu, IconButton } from '@radix-ui/themes';
import { MagnifyingGlassIcon, HeartIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import './Menu.css';

const Menu = () => {
  
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Flex className="menu" direction="row" justify="between" p="2" gap="2">
      <Container>
        <Flex direction="row" justify="between" align="center">
          <Heading as="h1" size="5">Events Around</Heading>
          <Flex align="center">
            <Button 
              className={location.pathname === '/search' ? "nav-button-selected" : "nav-button"}
              onClick={() => navigate('/search')}
            >
              <MagnifyingGlassIcon />
              Search
            </Button>
            <Button 
              className={location.pathname === '/favorites' ? "nav-button-selected" : "nav-button"}
              onClick={() => navigate('/favorites')}
            >
              <HeartIcon />
              Favorites
            </Button>
            <Box className="hamburger-menu">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <IconButton variant="ghost" size="2">
                    <HamburgerMenuIcon />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={() => navigate('/search')}>
                    <MagnifyingGlassIcon />
                    Search
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => navigate('/favorites')}>
                    <HeartIcon />
                    Favorites
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Box>
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );
}

export default Menu;